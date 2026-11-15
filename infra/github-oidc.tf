# GitHub Actions → AWS without stored keys (OIDC). GitHub signs a short-lived token
# for each workflow run; AWS trusts GitHub's token issuer and lets ONLY this repo's
# main branch (or its "production" environment) take on the deploy role. The role can
# do two things: push the app image to ECR, and run the deploy command on the web
# server through SSM. Nothing else — no console access, no other resources.

locals {
  github_repo = "cris0001/lift4me"
}

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "github_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Only runs on main, or jobs bound to the "production" environment, of this repo.
    # A fork, a pull request or another branch gets a different `sub` and is refused.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${local.github_repo}:ref:refs/heads/main",
        "repo:${local.github_repo}:environment:production",
      ]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name                 = "lift4me-github-deploy"
  description          = "GitHub Actions: push the app image to ECR and deploy it via SSM"
  assume_role_policy   = data.aws_iam_policy_document.github_assume.json
  max_session_duration = 3600
}

data "aws_iam_policy_document" "github_deploy" {
  # Logging in to ECR is account-wide by design (no resource-level scoping exists).
  statement {
    sid       = "EcrLogin"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid = "EcrPushApp"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:DescribeImages",
    ]
    resources = [aws_ecr_repository.app.arn]
  }

  # Run a shell script on the web server only (not on any other instance).
  statement {
    sid     = "DeployViaSsm"
    actions = ["ssm:SendCommand"]
    resources = [
      aws_instance.web.arn,
      "arn:aws:ssm:${data.aws_region.current.region}::document/AWS-RunShellScript",
    ]
  }

  # Read back the deploy's result and output.
  statement {
    sid       = "DeployResult"
    actions   = ["ssm:GetCommandInvocation", "ssm:ListCommandInvocations"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "push-image-and-deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

output "github_deploy_role_arn" {
  description = "Role GitHub Actions assumes (goes into the deploy workflow)"
  value       = aws_iam_role.github_deploy.arn
}

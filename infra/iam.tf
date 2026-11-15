# The server's own AWS identity: an IAM role the EC2 instance takes on, so it gets
# short-lived, auto-rotated credentials instead of keys stored on disk. It may do
# exactly three things:
# - be managed through SSM (Session Manager terminal + Run Command deploys — no SSH);
# - pull the app's Docker images from ECR;
# - read the app's secrets under /lift4me/prod/ in SSM Parameter Store.

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Who may take on the role: only the EC2 service, on behalf of our instance.
data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2" {
  name               = "lift4me-ec2-role"
  description        = "Lift4Me web server: SSM access, ECR pull, read prod secrets"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

# AWS-maintained policies for the first two jobs.
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ecr_read" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Secrets: read-only, and only this app's production parameters. SecureString values
# are encrypted with the AWS-managed aws/ssm key, whose policy already lets the account
# decrypt through SSM, so no extra KMS permission is needed.
data "aws_iam_policy_document" "read_secrets" {
  statement {
    actions = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParametersByPath"]
    resources = [
      "arn:aws:ssm:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:parameter/lift4me/prod",
      "arn:aws:ssm:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:parameter/lift4me/prod/*",
    ]
  }
}

resource "aws_iam_role_policy" "read_secrets" {
  name   = "read-prod-secrets"
  role   = aws_iam_role.ec2.id
  policy = data.aws_iam_policy_document.read_secrets.json
}

# EC2 attaches a role through an "instance profile" — a thin wrapper around it.
resource "aws_iam_instance_profile" "ec2" {
  name = "lift4me-ec2-profile"
  role = aws_iam_role.ec2.name
}

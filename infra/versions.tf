# Terraform core, the AWS provider, and where the state lives.
#
# State is kept in S3 (versioned, encrypted) with S3-native locking (use_lockfile),
# so two `apply` runs can't overlap. The bucket is created once by hand before the
# first `terraform init` — Terraform can't store its state in a bucket it manages
# itself (see infra/README.md).
terraform {
  required_version = ">= 1.11"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  backend "s3" {
    bucket       = "lift4me-tfstate-020737255414"
    key          = "prod/terraform.tfstate"
    region       = "eu-central-1"
    encrypt      = true
    use_lockfile = true
  }
}

# Credentials are never in these files: locally they come from the SSO profile picked
# by AWS_PROFILE=lift4me (after `aws sso login`), in CI from GitHub's OIDC role.
# Every resource gets the same tags, so the bill and the console can be filtered to
# this project.
provider "aws" {
  region = "eu-central-1"

  default_tags {
    tags = {
      Project     = "lift4me"
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}

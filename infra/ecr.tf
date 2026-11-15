# The app's Docker image registry. CI pushes one image per commit (tagged with the git
# SHA) and the server pulls it from here. Tags are immutable, so a SHA always means the
# same image — which is what makes a rollback to an earlier commit trustworthy.

resource "aws_ecr_repository" "app" {
  name                 = "lift4me"
  image_tag_mutability = "IMMUTABLE"

  # Basic vulnerability scan of every pushed image (free).
  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

# Keep the registry small: the 5 newest images stay (enough to roll back), older ones
# are deleted automatically.
resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the 5 most recent images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = { type = "expire" }
    }]
  })
}

output "ecr_repository_url" {
  description = "Where CI pushes and the server pulls the app image"
  value       = aws_ecr_repository.app.repository_url
}

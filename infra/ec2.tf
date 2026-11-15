# The web server: one t3.micro running Ubuntu 24.04 in the public subnet, behind the
# lift4me-web firewall, with the server role attached and a fixed public IP. It is
# prepared on first boot by cloud-init.yaml (Docker, swap, automatic security
# updates) — nobody logs in to set it up by hand.

# Latest official Ubuntu 24.04 LTS image from Canonical (their AWS account id).
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  # No key pair: there is no SSH. Access is through SSM Session Manager.

  user_data                   = file("${path.module}/cloud-init.yaml")
  user_data_replace_on_change = true

  # "standard" CPU credits: a long CPU spike slows the server down instead of adding
  # surprise charges to the bill (the t3 default, "unlimited", bills the overage).
  credit_specification {
    cpu_credits = "standard"
  }

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 20
    encrypted             = true
    delete_on_termination = true
  }

  # Instance metadata only through IMDSv2 (session tokens) — closes a classic way of
  # stealing the server's role credentials through a vulnerable app.
  metadata_options {
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  # Recover automatically onto healthy hardware if the underlying host fails.
  maintenance_options {
    auto_recovery = "default"
  }

  tags = { Name = "lift4me-web" }

  # A newer Ubuntu image appearing later must not replace a running server; image
  # upgrades are a deliberate rebuild, not a side effect of `terraform apply`.
  lifecycle {
    ignore_changes = [ami]
  }
}

# The fixed public address Cloudflare will point lift4.me at.
resource "aws_eip" "web" {
  domain   = "vpc"
  instance = aws_instance.web.id

  tags = { Name = "lift4me-web-ip" }

  depends_on = [aws_internet_gateway.main]
}

output "server_public_ip" {
  description = "Fixed public IP of the web server (for Cloudflare DNS)"
  value       = aws_eip.web.public_ip
}

output "server_instance_id" {
  description = "EC2 instance id (for SSM Session Manager and deploys)"
  value       = aws_instance.web.id
}

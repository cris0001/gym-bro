# The project's own network: one VPC with a single public subnet the server sits in,
# an internet gateway as its way in and out, and the firewall (security group) in
# front of the server. Everything here is free; one subnet in one availability zone
# is enough for a single server.

locals {
  az = "eu-central-1a"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "lift4me-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = { Name = "lift4me-igw" }
}

# No automatic public IP: the server gets a fixed Elastic IP instead (ec2.tf).
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = local.az
  map_public_ip_on_launch = false

  tags = { Name = "lift4me-public-a" }
}

# Traffic leaving the subnet for anywhere outside the VPC goes through the gateway.
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "lift4me-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Every VPC comes with a default security group that allows traffic between its
# members; strip it bare so nothing can end up relying on it by accident.
resource "aws_default_security_group" "default" {
  vpc_id = aws_vpc.main.id

  tags = { Name = "lift4me-default-locked" }
}

# The server's firewall: only HTTP and HTTPS come in. No SSH (port 22) — the server is
# reached through SSM Session Manager. Outbound is open (Neon, ECR, Strava, updates).
resource "aws_security_group" "web" {
  name        = "lift4me-web"
  description = "Web server: HTTP/HTTPS in, everything out"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "lift4me-web" }
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.web.id
  description       = "HTTP (redirected to HTTPS by Caddy)"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.web.id
  description       = "HTTPS"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "all" {
  security_group_id = aws_security_group.web.id
  description       = "All outbound"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

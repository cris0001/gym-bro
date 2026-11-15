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

# Cloudflare's published IPv4 ranges (https://www.cloudflare.com/ips-v4/, checked
# 2026-11-15). lift4.me is proxied by Cloudflare, so only Cloudflare ever needs to
# reach the server: anyone who learns its IP can't bypass Cloudflare's DDoS/bot
# protection and rate limits. Re-check the list now and then — Cloudflare announces
# changes well in advance and rarely changes it.
locals {
  cloudflare_ipv4 = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
  ]
}

# The server's firewall: HTTP and HTTPS in, from Cloudflare only. No SSH (port 22) —
# the server is reached through SSM Session Manager. Outbound is open (Neon, ECR,
# Strava, updates).
resource "aws_security_group" "web" {
  name        = "lift4me-web"
  description = "Web server: HTTP/HTTPS in, everything out"
  vpc_id      = aws_vpc.main.id

  tags = { Name = "lift4me-web" }
}

resource "aws_vpc_security_group_ingress_rule" "http" {
  for_each = toset(local.cloudflare_ipv4)

  security_group_id = aws_security_group.web.id
  description       = "HTTP from Cloudflare (redirected to HTTPS by nginx)"
  cidr_ipv4         = each.value
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "https" {
  for_each = toset(local.cloudflare_ipv4)

  security_group_id = aws_security_group.web.id
  description       = "HTTPS from Cloudflare"
  cidr_ipv4         = each.value
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

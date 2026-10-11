data "aws_route53_zone" "main" {
  name = var.main_domain_name
}

locals {
  ui_domain = "${var.ui_subdomain_name}.${var.fastapi_sandbox_subdomain_name}.${var.main_domain_name}"
}

resource "aws_route53_record" "ui" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = local.ui_domain
  type    = "CNAME"
  records = [var.github_pages_target]
  ttl     = 300
}

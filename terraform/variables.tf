variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "sa-east-1"
}

# DNS
variable "main_domain_name" {
  description = "Main domain name"
  type        = string
  default     = "25101999.xyz"
}

variable "fastapi_sandbox_subdomain_name" {
  description = "Subdomain for the fastapi-sandbox service"
  type        = string
  default     = "jstenghele-fastapi-sandbox"
}

variable "ui_subdomain_name" {
  description = "Subdomain for the UI service"
  type        = string
  default     = "ui"
}

variable "github_pages_target" {
  description = "GitHub Pages target host for the CNAME record"
  type        = string
  default     = "juanstenghele.github.io"
}

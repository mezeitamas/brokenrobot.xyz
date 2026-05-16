terraform {
  required_version = "~> 1.15.3"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.15.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

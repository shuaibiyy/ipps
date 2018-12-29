provider "aws" {
  region = "${var.region}"
}

data "terraform_remote_state" "tfstate" {
  backend = "s3"

  config {
    bucket = "${var.s3_bucket_name}"
    key    = "terraform/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {}

resource "aws_cloudfront_distribution" "prod" {
  origin {
    domain_name = "${var.s3_bucket_name}.s3.amazonaws.com"
    origin_id   = "S3-${var.s3_bucket_name}"

    s3_origin_config {
      origin_access_identity = "${aws_cloudfront_origin_access_identity.origin_access_identity.cloudfront_access_identity_path}"
    }
  }

  enabled             = true
  default_root_object = "index.html"
  retain_on_delete    = true

  logging_config {
    include_cookies = false
    bucket          = "${var.s3_bucket_name}.s3.amazonaws.com"
    prefix          = "cloudfront"
  }

  aliases = ["${var.s3_bucket_name}"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${var.s3_bucket_name}"

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    acm_certificate_arn      = "${var.acm_certificate_arn}"
    minimum_protocol_version = "TLSv1"
    ssl_support_method       = "sni-only"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${var.s3_bucket_name}/*"]

    principals {
      type        = "AWS"
      identifiers = ["${aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn}"]
    }
  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${var.s3_bucket_name}"]

    principals {
      type        = "AWS"
      identifiers = ["${aws_cloudfront_origin_access_identity.origin_access_identity.iam_arn}"]
    }
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = "${var.s3_bucket_name}"
  policy = "${data.aws_iam_policy_document.s3_policy.json}"
}

output "cloudfront_domain_name" {
  value = "[ ${aws_cloudfront_distribution.prod.domain_name} ]"
}

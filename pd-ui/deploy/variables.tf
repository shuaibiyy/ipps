variable "region" {
  description = "The AWS region."
  default = "us-east-1"
}

variable "acm_certificate_arn" {
  description = "ARN of SSL certificate issued by AWS."
}

variable "s3_bucket_name" {
  description = "Name of S3 bucket where the website is hosted."
}

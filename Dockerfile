FROM docker/sandbox-templates:kiro

# Set default IdP config as environment variables
ENV KIRO_IDP=https://unisouk.awsapps.com/start
ENV KIRO_REGION=ap-south-1

# Start interactive shell - login manually once, then use kiro-cli freely
CMD ["/bin/bash"]
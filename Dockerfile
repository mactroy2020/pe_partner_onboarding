#===============
# Certificate Authority Image
#===============
FROM ubuntu:latest

WORKDIR /ca

#-----
# Install base packages
#-----
RUN apt update
RUN apt upgrade -y
RUN apt install -y bash curl sudo gettext openssl

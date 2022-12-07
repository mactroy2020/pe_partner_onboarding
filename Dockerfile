#===============
# Certificate Authority Image
#===============
FROM ubuntu:latest

WORKDIR /ca

#-----
# Install base packages
#-----
RUN apt update
RUN apt install -y bash curl sudo gettext easy-rsa openssl

#-----
# Generate Certificate Authority
#-----
RUN ln -s /usr/share/easy-rsa/* /ca

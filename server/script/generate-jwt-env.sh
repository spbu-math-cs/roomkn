#!/bin/sh

mkdir local

echo "#!/bin/sh" > local/jwtRS256.env
echo >> local/jwtRS256.env

echo -n 'export JWT_SECRET=' >> local/jwtRS256.env
head --bytes 64 /dev/urandom | base64 -w 0 >> local/jwtRS256.env
echo '' >> local/jwtRS256.env

echo -n 'export PEPPER=' >> local/jwtRS256.env
head --bytes 64 /dev/urandom | base64 -w 0 >> local/jwtRS256.env
echo '' >> local/jwtRS256.env

chmod +x local/jwtRS256.env

echo "Environment script has been written to $(pwd)/local/jwtRS256.env"

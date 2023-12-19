VERSION         := $(shell pulumictl get version)

PACK            := nodelambda
PROJECT         := github.com/pierskarsenbarg/pulumi-${PACK}

PROVIDER        := pulumi-resource-${PACK}
CODEGEN         := pulumi-gen-${PACK}
VERSION_PATH    := provider/pkg/version.Version

WORKING_DIR     := $(shell pwd)
SCHEMA_PATH     := ${WORKING_DIR}/schema.json

generate:: gen_go_sdk gen_dotnet_sdk gen_nodejs_sdk gen_python_sdk

build:: build_provider build_dotnet_sdk build_nodejs_sdk build_python_sdk

install:: install_provider install_dotnet_sdk install_nodejs_sdk

# Ensure all dependencies are installed
# ensure::
# 	npm install

gen_types:: 
	cd ${PACK} && \
		npm install && \
		npm run gen-types

# Provider
build_provider:: 
	cp ${SCHEMA_PATH} ${PACK}
	cd ${PACK} && \
       		npm install && \
       		npx tsc && \
       		cp package.json schema.json ./bin && \
       		sed -i.bak -e "s/\$${VERSION}/$(VERSION)/g" bin/package.json

install_provider:: PKG_ARGS := --no-bytecode --public-packages "*" --public
install_provider:: build_provider
	cd ${PACK} && \
		npx pkg . ${PKG_ARGS} --target node18 --output ../bin/${PROVIDER}

# builds all providers required for publishing
dist:: PKG_ARGS := --no-bytecode --public-packages "*" --public
dist:: install_provider
	cd ${PACK} && \
 		npx pkg . ${PKG_ARGS} --target node18-macos-x64 --output ../bin/darwin-amd64/${PROVIDER} && \
 		npx pkg . ${PKG_ARGS} --target node18-macos-arm64 --output ../bin/darwin-arm64/${PROVIDER} && \
 		npx pkg . ${PKG_ARGS} --target node18-linuxstatic-x64 --output ../bin/linux-amd64/${PROVIDER} && \
 		npx pkg . ${PKG_ARGS} --target node18-linuxstatic-arm64 --output ../bin/linux-arm64/${PROVIDER} && \
 		npx pkg . ${PKG_ARGS} --target node18-win-x64 --output ../bin/windows-amd64/${PROVIDER}.exe
	mkdir -p dist
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-linux-amd64.tar.gz README.md LICENSE -C bin/linux-amd64/ .
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-linux-arm64.tar.gz README.md LICENSE -C bin/linux-arm64/ .
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-darwin-amd64.tar.gz README.md LICENSE -C bin/darwin-amd64/ .
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-darwin-arm64.tar.gz README.md LICENSE -C bin/darwin-arm64/ .
	tar --gzip -cf ./dist/pulumi-resource-${PACK}-v${VERSION}-windows-amd64.tar.gz README.md LICENSE -C bin/windows-amd64/ .

# Go SDK

gen_go_sdk::
	rm -rf sdk/go
	cd provider-gen && go run . go ../sdk/go ${SCHEMA_PATH}
	cd sdk && go mod tidy && cd -

## Empty build target for Go
build_go_sdk::


# .NET SDK

gen_dotnet_sdk:: DOTNET_VERSION := $(shell pulumictl get version --language dotnet)
gen_dotnet_sdk::
	rm -rf sdk/dotnet
	pulumi package gen-sdk bin/${PROVIDER} --language dotnet
	cd sdk/dotnet/&& \
		echo "${DOTNET_VERSION}" >version.txt && \
		dotnet build /p:Version=${DOTNET_VERSION}

build_dotnet_sdk:: DOTNET_VERSION := $(shell pulumictl get version --language dotnet)
build_dotnet_sdk:: gen_dotnet_sdk
	cd sdk/dotnet/ && \
		echo "${DOTNET_VERSION}" >version.txt && \
		cp ../../README.md ../../LICENSE . && \
		dotnet build /p:Version=${DOTNET_VERSION} 

install_dotnet_sdk:: build_dotnet_sdk
	rm -rf ${WORKING_DIR}/nuget
	mkdir -p ${WORKING_DIR}/nuget
	find . -name '*.nupkg' -print -exec cp -p {} ${WORKING_DIR}/nuget \;


# Node.js SDK

gen_nodejs_sdk::
	rm -rf sdk/nodejs
	pulumi package gen-sdk ./bin/${PROVIDER} --language nodejs

build_nodejs_sdk:: NODEJS_VERSION := $(shell pulumictl get version --language javascript)
build_nodejs_sdk:: gen_nodejs_sdk
	cd sdk/nodejs/ && \
		npm install && \
		npx tsc && \
		cp ../../README.md ../../LICENSE package.json package-lock.json ./bin/ && \
		sed -i.bak -e "s/\$${VERSION}/$(NODEJS_VERSION)/g" ./bin/package.json && \
		rm ./bin/package.json.bak

install_nodejs_sdk:: build_nodejs_sdk
	cd sdk/nodejs/bin && \
		npm ci && \
		npm link ${WORKING_DIR}/sdk/nodejs/bin

# Python SDK

gen_python_sdk::
	rm -rf sdk/python
	pulumi package gen-sdk bin/pulumi-resource-clouddns --language python
	cp ${WORKING_DIR}/README.md sdk/python

build_python_sdk:: PYPI_VERSION := $(shell pulumictl get version --language python)
build_python_sdk:: gen_python_sdk
	cd sdk/python/ && \
		python3 setup.py clean --all 2>/dev/null && \
		rm -rf ./bin/ ../python.bin/ && cp -R . ../python.bin && mv ../python.bin ./bin && \
		sed -i.bak -e 's/^VERSION = .*/VERSION = "$(PYPI_VERSION)"/g' -e 's/^PLUGIN_VERSION = .*/PLUGIN_VERSION = "$(VERSION)"/g' ./bin/setup.py && \
		rm ./bin/setup.py.bak && \
		cd ./bin && python3 setup.py build sdist

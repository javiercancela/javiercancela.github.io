---
title: Un blog en GitHub (I - Jekyll)
date: 2017-01-03 03:00:00 +0200
description: La experiencia de montar un blog en GitHub
categories:
  - blog
  - github
image: https://source.unsplash.com/V4EOZj7g1gw/2000x1322
comments: true
---
Para crear un blog en GitHub usaremos [GitHub Pages](https://pages.github.com/). Cada cuenta de GitHub dispone de un sitio gratuito en el que alojar recursos estáticos; para usarlo tan solo hay que crear un repositorio con el nombre *nombreusuario*.github.io. Los archivos que subamos a ese repositorio serán accesibles a través de http://nombreusuario.github.io.

Además, GitHub Pages soporta [Jekyll](https://github.com/jekyll/jekyll). Jekyll es un generador de sitios web desarrollado en Ruby. Es fácil de usar, y permite hacer todo lo que se necesita en un blog personal.

El proceso de instalación de Jekyll en Windows 10 pasa por:

### 1. Instalar Chocolatey
[Chocolatey](https://chocolatey.org/) es un gestor de paquetes para Windows. Desde la ventana de comandos lanzada en modo administrador, ejecutamos:
<div style="font-family: monospace;">
script
@powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((new-object net.webclient).DownloadString('https://chocolatey.org/install.ps1'))" && SET PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin
</div>
Esa línea se encarga de ejecutar un script de PowerShell que instala Chocolatey, y añade el ejecutable al path. 

Tras esto cerramos la línea de comandos.

### 2. Instalar Ruby
Ruby es un lenguaje de programación bastante popular. Para instalarlo abrimos de nuevo la consola en modo administrador y escribimos:
```script
choco install ruby -y
```


### 3. Instalar Jekyll
[Gem](http://guides.rubygems.org) es el gestor de paquetes de Ruby. Permite instalar tanto librerías como programas. Así que lo usaremos para instalar Jekyll:
```script
gem install jekyll
```

En este paso yo me encontré un error. Un problema con SSL: "SSL_connect returned=1 errno=0 state=SSLv3 read server certificate B: certificate verify failed". Para solucionarlo seguí las instrucciones de esta página: http://guides.rubygems.org/ssl-certificate-update/#manual-solution-to-ssl-issue. Hay que descargar este certificado: [GlobalSignRootCA.pem](https://raw.githubusercontent.com/rubygems/rubygems/master/lib/rubygems/ssl_certs/index.rubygems.org/GlobalSignRootCA.pem) y copiarlo en la carpeta de certificados de Gem (en mi caso, C:/tools/ruby23/lib/ruby/2.3.0/rubygems).

Y listo. Con 
```script
jekyll -v
```
comprobamos que jekyll se ha instalado correctamente.

El siguiente paso: montar el blog.
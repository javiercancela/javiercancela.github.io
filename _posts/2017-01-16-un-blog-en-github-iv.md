---
title: Un blog en GitHub (IV - Asignar un dominio)
date: 2017-01-16 22:00:00 +0200
description: La experiencia de montar un blog en GitHub
categories:
  - blog
  - github
image: https://source.unsplash.com/V4EOZj7g1gw/2000x1322
comments: true
---
Como hemos visto antes, la url de nuestro blog será http://nombreusuario.github.io, de forma que la url coincida con el nombre del repositorio. Si nos interesa, podemos cambiar el dominio de la página por un dominio de nuestra propiedad. Por ejemplo, la url de este blog es [http://www.javiercancela.com](http://www.javiercancela.com), en vez de [http://javiercancela.github.io](http://javiercancela.github.io). Veamos cómo se realiza este cambio.

En primer lugar, nos vamos a nuestro repositorio en GitHub y entramos en el apartado Settings. En mi caso, la url es https://github.com/javiercancela/javiercancela.github.io/settings. Aquí, en la parte inferior, en la sección "GitHub Pages", encontramos el campo "Custom domain". Escribo aquí `www.javiercancela.com` y pulso "Save". La parte de `www.` es opcional. Sin embargo, GitHub recomienda que use por cuestiones de rendimiento y estabilidad. Ver [www subdomains](https://help.github.com/articles/about-supported-custom-domains/#www-subdomains) (en inglés).

Una vez asignado el dominio en GitHub, configuraremos un par de cosas en nuestro proveedor de dominios. Vamos a añadir registros para el dominio javiercancela.com y su subdominio www.javiercancela.com. La forma de hacerlo varía según el proveedor, pero debería ser algo así:
* Añadimos un registro ALIAS o ANAME para javiercancela.com. Si no se soportan ALIAS ni ANAME, usaremos un registro A. Este tipo de registros asignan un dominio a una ip. Las ips que proporciona GitHub son 192.30.252.153 y 192.30.252.154. En mi caso mi proveedor no permite asignar registros ALIAS ni ANAME, por lo que los registros quedan así:
```
A   @   192.30.252.153
A   @   192.30.252.154
```
* Añadimos un registro CNAME para www.javiercancela.com. Este tipo de registros asocia un subdominio a otro dominio, que será el que sirva el contenido. el registro quedará así:
```
CNAME   www   javiercancela.github.io
```

El cambio tardará un rato en propagarse, pero al cabo de unas horas el blog estará disponible en http://www.javiercancela.com. Al poner el subdominio `www.javiercancela.com` como dominio personalizado tanto http://javiercancela.com como http://javiercancela.github.io redirigirán a este.

## Configurar acceso SSL
Una limitación de lo que hemos hecho hasta ahora es que nuestro dominio no va a funcionar (correctamente, al menos) a través de https. Los navegadores comprueban que el certificado del servidor, con el que se cifra la conexión SSL, sea válido para el dominio al que se está accediendo. Como nuestra página está en los servidores de GitHub, el certificado sólo cubre dominios *.github.io, por lo que los navegadores mostrarán un mensaje de error alertando de la posibilidad de que la página tenga un propósito fraudulento. 

Hoy en día cualquier página debería estar disponible a través de https, así que tenemos que corregir este problema. Para ello vamos a usar [Cloudeflare](https://www.cloudflare.com), un [CDN](https://es.wikipedia.org/wiki/Red_de_entrega_de_contenidos) con servicios SSL gratuitos. La información que se indica a continuación está sacada de estos dos posts:
* [Setting up SSL on GitHub Pages](https://blog.keanulee.com/2014/10/11/setting-up-ssl-on-github-pages.html)
* [Set Up SSL on Github Pages With Custom Domains for Free](https://sheharyar.me/blog/free-ssl-for-github-pages-with-custom-domains/)

Lo primero que haremos será crear una cuenta con nuestro dominio (`javiercancela.com`, en este caso usamos el dominio principal, ya que el certificado cubrirá todos los subdominios). Después tendremos que ir a nuestro proveedor de dominios y cambiar los nameservers que estemos usando por los que proporciona Cloudeflare: `curt.ns.cloudflare.com` y `jessica.ns.cloudflare.com`. Finalmente accederemos a la opción Crypto->SSL de nuestro dominio y cambiaremos el valor "Full" por "Flexible".

El cambio debería ser casi inmediato, si probamos en unos minutos a acceder a nuestro blog vía https comprobaremos que la conexión ya es segura. 

Como último paso vamos a modificar la plantilla por defecto para asegurarnos de que los usuarios acceden siempre por https. En el archivo `_layouts\default.html`, añadimos justo tras el `<head>`:
```html
<script type="text/javascript">
    var host = "www.javiercancela.com";
    if ((host == window.location.host) && (window.location.protocol != "https:"))
        window.location.protocol = "https";
</script>
```
Este código javascript le indica al navegador que cambie el protocolo a https, si no es el que ya está usando. 


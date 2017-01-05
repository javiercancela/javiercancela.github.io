---
title: Un blog en GitHub (III - Crear un post)
date: 2017-01-12 22:00:00 +0200
description: La experiencia de montar un blog en GitHub
categories:
  - blog
  - github
image: https://source.unsplash.com/V4EOZj7g1gw/2000x1322
comments: true
---
Los posts son archivos en formato [markdown](https://daringfireball.net/projects/markdown/) (aunque también se puede usar html), que se guardan en la carpeta `_posts`. Como otros archivos, tienen un _front matter_ que permite asignarles propiedades. Por ejemplo, este es el _front matter_ de este post:
```
---
title: Un blog en GitHub (III - Crear un post)
date: 2017-01-12 22:00:00 +0200
description: La experiencia de montar un blog en GitHub
categories:
  - blog
  - github
image: https://source.unsplash.com/V4EOZj7g1gw/2000x1322
comments: true
---
```
Las propiedades ahí indicadas serán usadas por el archivo de _layout_ del post (`_layouts/post.html`) y sus _includes_ para mostrar la imagen en la cabecera, poner la fecha del post, mostrar o no los comentarios de [disqus](https://disqus.com/), y mostrar las categorías correspondientes.

Para publicar el post, y en general para actualizar cualquier aspecto de nuestro sitio web, bastará con hacer un push a la rama por defecto del repositorio (si no la hemos cambiado, será la rama `master`). Para los que no conozcan nada de Git, una buena guía básica en castellano es [esta](http://rogerdudler.github.io/git-guide/index.es.html).

## Markdown
Markdown es un formato muy simple, y lo habitual es utilizar un editor de texto para crear los documentos. Yo uso [Sublime Text 3](https://www.sublimetext.com/3) por varios motivos: es increíblemente rápido, tiene montones de extensiones para todo tipo de cosas, es multiplataforma y permite exportar toda su configuración de forma sencilla. De hecho lo utilizo para editar todo el blog: html, js, css,...

También está el detalle de que es gratuito. Bueno, en realidad se puede usar sin licencia para evaluarlo, aunque incluye un recordatorio periódico para que compres una licencia si tienes pensado darle un uso continuado. La licencia vale 70$, y permite que una persona use la aplicación en todos los dispositivos que desee.

Una buena referencia del formato es la guía de GitHub [Mastering Markdwon](https://guides.github.com/features/mastering-markdown/). Incluye ejemplos detallados y la referencia de los aspectos específicos del Markdown que acepta GitHub.

## Publicar un post
Los posts en Markdown se convierten a html, con lo que su aspecto dependerá tanto de los formatos que hayamos especificado como de los estilos que tenga nuestro sitio web. Para ver cómo queda un post basta con que jekyll se esté ejecutando en el directorio local de nuestro repositorio. Esto se puede hacer con el comando
```
jekyll serve --future
```
El parámetro `--future` le dice a Jekyll que muestre la información publicada en una fecha futura. Una práctica habitual consiste en indicar una fecha futura en el _front matter_ del post. De este modo podemos publicarlo en cualquier momento, pero sólo será visible cuando llegue la fecha indicada. Sin embargo, para revisar localmente cómo queda un post nos interesa verlo con independencia de su fecha, lo que conseguimos con este parámetro.

En el caso de mi blog, y debido a que la plantilla usada utiliza varios _plugins_ Ruby, necesitamos ejecutar Jekyll en el contexto del bundle Ruby asociado. Esto lo hacemos así:
```
bundle exec jekyll serve --future
```




---
title: Un blog en GitHub (II - Estructura del sitio)
date: 2017-01-09 22:00:00 +0200
description: La experiencia de montar un blog en GitHub
categories:
  - blog
  - github
image: https://source.unsplash.com/V4EOZj7g1gw/2000x1322
comments: true
---
La forma más eficiente de montar un blog con Jekyll consiste en descargarse una plantilla y modificarla según nuestras necesidades. La página [Jekyll Tips](http://jekyll.tips/templates/) tiene varias plantillas para elegir. Yo me decanté por [Frisco](https://github.com/CloudCannon/frisco-jekyll-template).

Para instalar la plantilla basta con hacer un fork del repositorio, y renombrarlo como nombreusuario.github.io. Sin hacer nada más tendremos un sitio de ejemplo instalado en nuestra página (http://nombreusuario.github.io).

La página de este blog es [http://javiercancela.github.io](http://javiercancela.github.io), y el repositorio es [https://github.com/javiercancela/javiercancela.github.io](https://github.com/javiercancela/javiercancela.github.io), donde se puede encontrar todo el código al que me refiero más abajo.

Como esta plantilla está pensada como página corporativa, lo primero que hice fue eliminar todo salvo el blog (que pasé al raíz de la web). Después añadí una página "Sobre mí" usando el html de la página raíz original. Para estos cambios sólo hizo falta mover los archivos de sitio, cambiar alguna ruta relativa y actualizar el menú y el pie de página (los archivos footer.yml y navigatio.yml de la carpeta _data). En el footer actualicé también los enlaces de las redes sociales. Tampoco hay que olvidarse de actualizar los datos del _config.yml. 

## Front matter
Los archivos html y md (Markdown) de los sitios creados en Jekyll suelen comenzar por una sección delimitada por tres guiones. Algo así:
```
---
title: Blog
layout: default
description: El blog de Javier Cancela.
image: https://source.unsplash.com/EZSm8xRjnX0/2000x1322
---
```

El propósito de esta cabecera, llamada en inglés _front matter_, es definir valores y metadatos para su archivo. El ejemplo de arriba está sacado del archivo `index.html` de la raíz de la página. Ese archivo contiene únicamente un par de elementos `<section>` con el html específico de la pantalla de inicio. El resto del html es compartido con más páginas y está en `_layouts\default.html` para ser reutilizado fácilmente (los archivos _layout_ contienen un elemento `{% raw %}{{ content }}{% endraw %}` que se sustituye por el contenido del archivo al que se aplica el _layout_). Así, la línea
```
layout: default
```
del _front matter_ es un metadato de la página. Y la línea
```
image: https://source.unsplash.com/EZSm8xRjnX0/2000x1322
```
es una variable, que permite que dentro del html de la página accedamos a esa url con `page.image`.

Para no tener que indicar el _layout_ en cada página, podemos definir en el archivo `_config.yml` el layout por defecto, así como _layouts_ específicos para tipos de archivos o para ciertas rutas:
```
defaults:
  -
    scope:
      path: ""
    values:
      layout: "default"
  -
    scope:
      type: "posts"
    values:
      layout: "post"
```

## Includes
El _layout_ nos sirve para compartir una estructura html común entre páginas. Pero a veces necesitamos reutilizar pequeños trozos de código en distintas partes de nuestra web. En estos casos utilizamos la carpeta `_includes`, donde guardaremos el código a reutilizar en archivos html. Veamos un ejemplo.

El _layout_ para los archivos de tipo post de este sitio (los incluidos en la carpeta `_posts`) es `_layouts\post.html`. Este archivo (que usa a su vez otro _layout_, no hay problema en encadenarlos) contiene la siguiente línea:
```
{% raw %}{% include post-title.html post=page %}{% endraw %}
```
Esta línea nos dice que en ese punto del archivo se va a insertar el código incluido en `_includes\post-title.html`, y se le va a pasar la propiedad `page` en la variable `post`. La propiedad `page` nos da acceso a las variables definidas en el _front matter_, así como a otras propiedades como la url de la página. Al pasarla al _include_ conseguimos que estas propiedades también estén disponibles allí.

El archivo `_includes\post-title.html` contiene este código:
```html
{% raw %}
<p class="post-details">
    {% for category in include.post.categories %}
        <span class="blog-filter">
            <a href="{{ site.baseurl }}/category/{{ category}}/">{{ category | capitalize }}</a>
        </span>
    {% endfor %}
    {% if post.date %}
        {% assign postdate = post.date %}
    {% else %}  
        {% assign postdate = page.date %}
    {% endif %}
    {% assign months = "enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre" | split: "|" %}
    {% assign m = postdate | date: "%-m" | minus: 1 %}
    {% assign day = postdate | date: "%d" %}
    {% assign month = months[m] %}
    {% assign year = postdate | date: "%Y" %}
    <span class="post-date">{{ day }} de {{ month }} de {{ year }}</span>
</p>
{% endraw %}
```
Las partes rodeadas de `{% raw %}{% y %}{% endraw %}` son código [Liquid](http://shopify.github.io/liquid/), un lenguaje de plantillas usado en Jekyll para generar html estático de forma simple. 

En el código vemos como se recorren los valores de `include.post.categories`. `include.post` nos da acceso a la variable `post` a la que hacíamos referencia más arriba, correspondiente a la propiedad `page` de la página donde se va a incluir el código. `categories` es una propiedad añadida por el _plugin_ [jekyll-archives](https://github.com/jekyll/jekyll-archives), y nos da acceso a las categorías que hayamos asignado al post en su _front matter_. Con ellas se crea un enlace para ver todos los posts de cada categoría.

El resto del código crea la fecha del post. El código está adaptado de esta [respuesta de StackOverflow](http://stackoverflow.com/a/32914455). 

Con esto ya estamos listos para empezar a escribir el blog.

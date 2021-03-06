---
id: 111
title: 'Introducción al desarrollo de aplicaciones para teléfonos móviles: Windows Mobile'
date: 2007-10-19T12:24:53+00:00
author: javiercancela
layout: post
guid: http://javiercancela.com/2007/10/19/introduccion-al-desarrollo-de-aplicaciones-para-telefonos-moviles-windows-mobile/
categories:
  - windows-mobile
image: /images/obsolete.jpg
---
Windows Mobile es el sistema operativo de Microsoft destinado a dispositivos móviles. La evolución de Windows Mobile, que se puede encontrar en la [Wikipedia](http://en.wikipedia.org/wiki/Windows_Mobile#Versions "Windows Mobile Versions"), refleja la evolución de los dispositivos de bolsillo durante los últimos años. Básicamente se originó en una versión del kernel de Windows para sistemas embebidos que fue creciendo hasta ser un sistema operativo para ordenadores de bolsillo (Pocket PCs) y smartphones.

Un Pocket PC es una PDA con sistema operativo Windows PocketPC o Mobile (según la versión). Como quiera que ya casi todas las PDAs incorporan teléfono móvil el concepto de PDA o PocketPC sin móvil probablemente desaparecerá pronto.
  
El término smartphone nunca tuvo una definición clara. La definición que da la [Wikipedia](http://en.wikipedia.org/wiki/Smartphone "Smartphone") (“…es un teléfono móvil que ofrece capacidades avanzadas más allá de un típico teléfono móvil, frecuentemente con funcionalidad similar a la de un ordenador personal.”) es lo suficientemente amplia como para resultar inútil, lo cual es apropiado para un término que hoy en día ya no tiene sentido: casi cualquier móvil en el mercado incorpora al menos una máquina virtual de Java que permite que sea programado. Con motivo de la aparición de la última versión de Windows Mobile, WM6, Microsoft [redefinió estos términos](http://www.microsoft.com/downloads/details.aspx?FamilyID=06111a3a-a651-4745-88ef-3d48091a390b&DisplayLang=en#Overview "Windows Mobile 6 Professional and Standard Software Development Kits Refresh - Overview") para darles un poco de coherencia con las [distintas modalidades de WM](http://msdn2.microsoft.com/en-us/library/bb158525.aspx "What's New in Naming Conventions for Windows Mobile 6").

Para desarrollar aplicaciones para Windows Mobile 6 necesitamos bajarnos una de las SDKs disponibles: la Standard para Smartphones, o la Professional para Pocket PCs (normales o Phone Edition). Si no os habéis leído el enlace anterior, un SmartPhone para Microsoft es como un Pocket PC Phone Edition, pero más pequeño y sin Office Mobile.

Para instalar la SDK necesitaremos lo que se indica en la [sección de requisitos de la página de descargas](http://www.microsoft.com/downloads/details.aspx?FamilyID=06111a3a-a651-4745-88ef-3d48091a390b&DisplayLang=en#Requirements "Windows Mobile 6 Professional and Standard Software Development Kits Refresh - System Requirements"), donde puede sorprender este punto:

> Microsoft Visual Studio 2005, Standard Edition or above (Express Editions are not supported).

Es decir, si quieres instalar la SDK cómprate el Visual Studio (las ediciones Express que dice que no son soportadas son las versiones gratuitas de Visual C# o VB.NET). Es un poco sorprendente que Microsoft no proporcione ninguna forma gratuita de que un aficionado realice desarrollos para Windows Mobile (salvo que piensen que con la cantidad de versiones pirata de Visual Studio que circulan por ahí esta restricción no es relevante).

Una vez todo instalado tenemos lo necesario para realizar aplicaciones para WM6. Se pueden desarrollar dos tipos de aplicaciones para Windows Mobile: con código nativo o con código administrado (managed code). Llamamos código nativo al código C++ que utiliza directamente la API de Windows Mobile, y código administrado al que utiliza las clases del .NET Compact Framework con C# o VB.Net. (Windows Mobile es la única plataforma móvil importante que no soporta J2ME; hablaremos de J2ME en un futuro artículo).
  
¿Las diferencias entre ambas? El código nativo es más rápido y ocupa menos, además de proporcionar acceso a algunas características del hardware que son inaccesibles desde el Compact Framework. Sin embargo, en la mayor parte de los casos desarrollar código administrado es la mejor opción. El tamaño del ejecutable es cada vez menos importante, y si la velocidad es un factor crítico siempre se puede optar por programar en código nativo las partes de la aplicación que supongan un cuello de botella. Por lo demás, el desarrollo en .NET resulta mucho más fácil y cómodo (al menos para los que no son especialistas en C++ y la API de Windows).

Como resumen, podemos decir que el desarrollo de aplicaciones para Windows Mobile presenta como inconvenientes la falta de alternativas al Visual Studio y el consiguiente desembolso económico necesario para adquirir una licencia. Por otra parte, el lado positivo se encuentra tanto en la calidad de las herramientas disponibles (el propio Visual Studio, los emuladores, la SDK y su documentación…) como en la activa comunidad de desarrolladores existente y agrupada en torno al portal de desarrollo de Microsoft, la [MSDN](http://msdn2.microsoft.com/en-us/library/bb847935.aspx "Windows Mobile ").

### Entradas relacionadas:

[Introducción al desarrollo de aplicaciones para teléfonos móviles: Symbian]({% post_url 2007/2007-10-17-introduccion-al-desarrollo-de-aplicaciones-para-telefonos-moviles-symbian %})
  
[Introducción al desarrollo de aplicaciones para teléfonos móviles: J2ME (I)]({% post_url 2007/2007-10-25-introduccion-al-desarrollo-de-aplicaciones-para-telefonos-moviles-j2me-i %})
  
[Introducción al desarrollo de aplicaciones para teléfonos móviles: J2ME (y II)]({% post_url 2007/2007-10-30-introduccion-al-desarrollo-de-aplicaciones-para-telefonos-moviles-j2me-y-ii %})
  
[Introducción al desarrollo de aplicaciones para teléfonos móviles: BlackBerry]({% post_url 2007/2007-11-05-introduccion-al-desarrollo-de-aplicaciones-para-telefonos-moviles-blackberry %})
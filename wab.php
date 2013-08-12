<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">
        <link rel="stylesheet" href="wabtoolbar.css">
    </head>
    <body>
      <? include('wab-toolbar.html'); ?>
      <script>window.jQuery || document.write('<script src="jquery-1.9.1.min.js"><\/script>')</script>
      <script src="src/wab.js"></script>
      <script>
        setTimeout(function() {
          Wab.DebugToolbar.init();
        }, 0);
      </script>
    </body>
</html>

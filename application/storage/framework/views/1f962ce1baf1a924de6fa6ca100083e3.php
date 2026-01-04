<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>" dir="<?php echo e(in_array(app()->getLocale(), ['ar']) ? 'rtl' : 'ltr'); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

        <title inertia><?php echo e(isset($page['props']['proposal']['title']) ? $page['props']['proposal']['title'] . ' - Proposal' : config('app.name', 'CatalystExplorer')); ?></title>
        
        <?php if(isset($page['props']['ogMeta'])): ?>
        
        <meta property="og:title" content="<?php echo e($page['props']['proposal']['title'] ?? config('app.name')); ?>" inertia>
        <meta property="og:description" content="<?php echo e($page['props']['ogMeta']['description'] ?? 'Explore Project Catalyst proposals'); ?>" inertia>
        <meta property="og:image" content="<?php echo e($page['props']['ogMeta']['ogImageUrl'] ?? ''); ?>" inertia>
        <meta property="og:url" content="<?php echo e($page['props']['ogMeta']['proposalUrl'] ?? url()->current()); ?>" inertia>
        <meta property="og:type" content="website" inertia>
        
        <meta name="twitter:card" content="summary_large_image" inertia>
        <meta name="twitter:title" content="<?php echo e($page['props']['proposal']['title'] ?? config('app.name')); ?>" inertia>
        <meta name="twitter:description" content="<?php echo e($page['props']['ogMeta']['description'] ?? 'Explore Project Catalyst proposals'); ?>" inertia>
        <meta name="twitter:image" content="<?php echo e($page['props']['ogMeta']['ogImageUrl'] ?? ''); ?>" inertia>
        <?php endif; ?>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        <?php echo app('Tighten\Ziggy\BladeRouteGenerator')->generate(); ?>
        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')([
          'resources/js/app.tsx',
          "resources/js/Pages/{$page['component']}.tsx"
         ]); ?>
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>

        <?php if(config('services.fathom.site_id')): ?>
            <script src="https://cdn.usefathom.com/script.js" data-site="<?php echo e(config('services.fathom.site_id')); ?>" defer></script>
        <?php endif; ?>
    </head>
    <body class="font-sans antialiased">
        <?php if (!isset($__inertiaSsrDispatched)) { $__inertiaSsrDispatched = true; $__inertiaSsrResponse = app(\Inertia\Ssr\Gateway::class)->dispatch($page); }  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } elseif (config('inertia.use_script_element_for_initial_page')) { ?><script data-page="app" type="application/json"><?php echo json_encode($page); ?></script><div id="app"></div><?php } else { ?><div id="app" data-page="<?php echo e(json_encode($page)); ?>"></div><?php } ?>
    </body>
</html>
<?php /**PATH /var/www/resources/views/app.blade.php ENDPATH**/ ?>
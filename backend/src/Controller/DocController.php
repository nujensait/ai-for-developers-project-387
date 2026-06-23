<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Serves API documentation: Swagger UI driven by the OpenAPI document
 * generated from the TypeSpec contract (Design-First).
 */
class DocController extends AbstractController
{
    #[Route('/api/openapi.yaml', name: 'api_openapi', methods: ['GET'])]
    public function spec(): Response
    {
        $path = $this->getParameter('kernel.project_dir').'/public/openapi.yaml';
        if (!is_file($path)) {
            return new Response(
                "openapi: 3.1.0\ninfo:\n  title: Calendar API\n  version: 1.0.0\npaths: {}\n",
                Response::HTTP_OK,
                ['Content-Type' => 'application/yaml'],
            );
        }

        return new Response((string) file_get_contents($path), Response::HTTP_OK, [
            'Content-Type' => 'application/yaml',
        ]);
    }

    #[Route('/api/doc', name: 'api_doc', methods: ['GET'])]
    public function ui(): Response
    {
        $html = <<<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Calendar API — Documentation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>body { margin: 0; } #swagger-ui { max-width: 1200px; margin: 0 auto; }</style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script>
        window.onload = function () {
            window.ui = SwaggerUIBundle({
                url: '/api/openapi.yaml',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [SwaggerUIBundle.presets.apis],
            });
        };
    </script>
</body>
</html>
HTML;

        return new Response($html, Response::HTTP_OK, ['Content-Type' => 'text/html']);
    }
}

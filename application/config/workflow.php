<?php

use Illuminate\Support\Facades\Auth;

return [
    "completed-project-nfts" => [
        "auth" => true,
        "steps" => [
            1 => [
                "title" => "Claim ideascale Profile",
                "component" => "Pages/CompletedProjectNfts/Partials/ProfileWorkflow",
                'requirements' => [
                    'auth' => "",
                ],
                "props" =>[
                        
        
                ] 
            ],
            2 => '',
            3 => '',
            4 => '',
        ],
    ],
    "drep" => [
        "auth" => true,
        "steps" => [
            1 => '',
            2 => '',
            3 => '',
            4 => '',
        ],
    ],
];

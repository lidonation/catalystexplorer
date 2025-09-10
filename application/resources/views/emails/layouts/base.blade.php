<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>@yield('title', 'Catalyst Explorer')</title>
    <style type="text/css">
        body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body, #bodyTable, #bodyCell { height: 100% !important; margin: 0; padding: 0; width: 100% !important; }

        .wrapper { background-color: #f8fafc; }
        .container { width: 100%; max-width: 650px; margin: 0 auto; }
        .content { background-color: #ffffff; border-radius: 16px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .inner { padding: 28px; }
        .text { font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: normal; color: #6b7280; font-weight: 500; }
        .greeting { margin-bottom: 20px; font-size: 14px; color: #374151; line-height: 1.6; font-family: 'Inter', Arial, sans-serif; }
        .body-text { text-align: justify; margin-bottom: 20px; }
        .signature { margin-top: 20px; }
        .team-name { font-weight: 700; }
        .logo-container { text-align: center; margin-bottom: 30px; }
        .logo-img { max-width: 300px; height: auto; display: block; margin: 0 auto; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { 
            background-color: #0891b2; 
            color: #ffffff !important;
            text-decoration: none !important;
            padding: 12px 28px; 
            border-radius: 6px; 
            display: inline-block; 
            font-weight: 600;
            font-size: 14px;
        }
        .button:hover { background-color: #0e7490; }
        .tags-container { text-align: center; margin: 20px 0; }
        .tag { 
            background-color: #0891b2; 
            color: #ffffff; 
            padding: 6px 14px; 
            border-radius: 20px; 
            display: inline-block; 
            margin: 4px; 
            font-size: 14px; 
            text-decoration: none;
        }
        .footer { padding: 20px 28px; text-align: center; }
        .footer-text { font-size: 14px; color: #6b7280; line-height: 1.4; }
        .footer-link { color: #0891b2; text-decoration: none; }
        .email-bold { font-weight: 600; }

        h1 { color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 20px 0; font-family: 'Inter', Arial, sans-serif; }
        h2 { color: #1f2937; font-size: 20px; font-weight: 600; margin: 20px 0 15px 0; font-family: 'Inter', Arial, sans-serif; }
        p { color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; font-family: 'Inter', Arial, sans-serif; }
        strong { font-weight: 600; color: #1f2937; }
        a { color: #0891b2; text-decoration: none; }
        
        ul, ol { 
            color: #374151 !important; 
            font-size: 14px !important; 
            line-height: 1.6 !important;
            margin: 16px 0 !important;
            padding-left: 20px !important;
            font-family: 'Inter', Arial, sans-serif !important;
        }
        li { 
            color: #374151 !important; 
            font-size: 14px !important; 
            line-height: 1.6 !important;
            margin-bottom: 8px !important;
            font-family: 'Inter', Arial, sans-serif !important;
        }
        
        @media only screen and (max-width: 600px) {
            .container { width: 95% !important; }
            .inner { padding: 20px !important; }
            ul, ol { padding-left: 15px !important; }
        }
        
        @yield('styles')
    </style>
</head>
<body>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapper">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" class="container">
                    <!-- Main Content Card -->
                    <tr>
                        <td class="content">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td class="inner">
                                        @include('emails.partials.header', ['logoUrl' => $logoUrl ?? config('app.url') . '/img/cx-nova-logo.png'])
                                        
                                        @yield('content')
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    @include('emails.partials.footer', ['user' => $user ?? null])
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
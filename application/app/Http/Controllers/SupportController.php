<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Mail\SupportRequestMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    /**
     * Display the support page.
     */
    public function index(): Response
    {
        return Inertia::render('Support');
    }

    /**
     * Handle the support form submission.
     */
    public function submit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        try {
            Mail::to('support@catalystexplorer.com')
                ->send(new SupportRequestMail(
                    $validated['name'],
                    $validated['email'],
                    $validated['message']
                ));

            return back()->with('success', 'Your message has been sent successfully. We\'ll get back to you soon!');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Failed to send your message. Please try again later.']);
        }
    }
}

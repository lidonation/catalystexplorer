<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\CatalystDrep;
use App\Models\IdeascaleProfile;
use App\Models\BookmarkCollection;
use Inertia\Testing\AssertableInertia as Assert;


it('renders all workflows pages', function (string $path, string $component) {
    $user = User::factory()->create();
    $profile = IdeascaleProfile::factory()->create();
    $bookmarkCollection = BookmarkCollection::factory()->create();

    $drep = CatalystDrep::factory(state: ['user_id' => $user->first()->id])->create();

    $path = str_replace('{profile}', $profile->hash, $path);

    $path = str_replace('{bookmarkCollection}', $bookmarkCollection->hash, $path);


    $this->actingAs($user)
        ->get($path)
        ->assertOk()
        ->assertInertia(fn(Assert $page) => $page->component($component));
})->with([
    // claim profile
    [
        'path' => 'en/workflows/claim-ideascale-profile/steps/1',
        'component' => 'Workflows/ClaimIdeascaleProfile/Step1',
    ],
    [
        'path' => 'en/workflows/claim-ideascale-profile/steps/2',
        'component' => 'Workflows/ClaimIdeascaleProfile/Step2',
    ],
    [
        'path' => 'en/workflows/claim-ideascale-profile/steps/3?profile={profile}',
        'component' => 'Workflows/ClaimIdeascaleProfile/Step3',
    ],
    // signature
    [
        'path' => 'en/workflows/signature-capture/steps/1',
        'component' => 'Workflows/SignatureCapture/Step1',
    ],
    [
        'path' => 'en/workflows/signature-capture/steps/2',
        'component' => 'Workflows/SignatureCapture/Step2',
    ],
    [
        'path' => 'en/workflows/signature-capture/steps/success',
        'component' => 'Workflows/SignatureCapture/Success',
    ],
    // bookmarks
    [
        'path' => 'en/workflows/create-bookmarks/steps/1',
        'component' => 'Workflows/CreateBookmark/Step1',
    ],
    [
        'path' => 'en/workflows/create-bookmarks/steps/2',
        'component' => 'Workflows/CreateBookmark/Step2',
    ],
    [
        'path' => 'en/workflows/create-bookmarks/steps/3?bookmarkCollection={bookmarkCollection}',
        'component' => 'Workflows/CreateBookmark/Step3',
    ],
    [
        'path' => 'en/workflows/create-bookmarks/steps/4?bookmarkCollection={bookmarkCollection}',
        'component' => 'Workflows/CreateBookmark/Step4',
    ],
    [
        'path' => 'en/workflows/create-bookmarks/steps/success',
        'component' => 'Workflows/CreateBookmark/Success',
    ],

    // dreps-signup
    [
        'path' => 'en/workflows/drep-sign-up/steps/1',
        'component' => 'Workflows/CatalystDrepSignup/Step1',
    ],
    [
        'path' => 'en/workflows/drep-sign-up/steps/2',
        'component' => 'Workflows/CatalystDrepSignup/Step2',
    ],
    [
        'path' => 'en/workflows/drep-sign-up/steps/3',
        'component' => 'Workflows/CatalystDrepSignup/Step3',
    ],
    [
        'path' => 'en/workflows/drep-sign-up/steps/5',
        'component' => 'Workflows/CatalystDrepSignup/Step5',
    ],
    [
        'path' => 'en/workflows/drep-sign-up/steps/4',
        'component' => 'Workflows/CatalystDrepSignup/Success',
    ],
    // completed projects nft
    [
        'path' => 'en/workflows/completed-projects-nfts/steps/1',
        'component' => 'Workflows/CompletedProjectNfts/Step1',
    ],
    [
        'path' => 'en/workflows/completed-projects-nfts/steps/2',
        'component' => 'Workflows/CompletedProjectNfts/Step2',
    ],
    // create voter list CreateVoterList
    [
        'path' => 'en/workflows/create-voter-list/steps/1',
        'component' => 'Workflows/CreateVoterList/Step1',
    ],
    [
        'path' => 'en/workflows/create-voter-list/steps/2',
        'component' => 'Workflows/CreateVoterList/Step2',
    ],
    [
        'path' => 'en/workflows/create-voter-list/steps/3',
        'component' => 'Workflows/CreateVoterList/Step3',
    ],
    [
        'path' => 'en/workflows/create-voter-list/steps/4',
        'component' => 'Workflows/CreateVoterList/Step4',
    ],
    [
        'path' => 'en/workflows/create-voter-list/success',
        'component' => 'Workflows/CreateVoterList/Success',
    ],

    // SubmitVotes
    [
        'path' => 'en/workflows/submit-votes/steps/1',
        'component' => 'Workflows/SubmitVotes/Step1',
    ],
    [
        'path' => 'en/workflows/submit-votes/steps/2',
        'component' => 'Workflows/SubmitVotes/Step2',
    ],
    [
        'path' => 'en/workflows/submit-votes/steps/3',
        'component' => 'Workflows/SubmitVotes/Step3',
    ],
    [
        'path' => 'en/workflows/submit-votes/steps/4',
        'component' => 'Workflows/SubmitVotes/Step4',
    ],
    [
        'path' => 'en/workflows/submit-votes/steps/5',
        'component' => 'Workflows/SubmitVotes/Step5',
    ],
    [
        'path' => 'en/workflows/submit-votes/steps/success',
        'component' => 'Workflows/SubmitVotes/Success',
    ],


    
]);

    // public function test_claim_ideascale_profile_step_returns_200()
    // {
    //     $response = $this->get('/workflows/claim-ideascale-profile/steps/1');
    //     $response->assertStatus(200);
    // }

    // public function test_create_voter_list_step_returns_200()
    // {
    //     $response = $this->get('/workflows/create-voter-list/steps/1');
    //     $response->assertStatus(200);
    // }

    // public function test_create_voter_list_success_returns_200()
    // {
    //     $response = $this->get('/workflows/create-voter-list/success');
    //     $response->assertStatus(200);
    // }

    // public function test_submit_votes_success_returns_200()
    // {
    //     $response = $this->get('/workflows/submit-votes/steps/success');
    //     $response->assertStatus(200);
    // }

    // public function test_bookmarks_step_returns_200()
    // {
    //     $response = $this->get('/workflows/create-bookmarks/steps/1');
    //     $response->assertStatus(200);
    // }

    // public function test_drep_signup_step_returns_200()
    // {
    //     $response = $this->get('/workflows/drep-sign-up/steps/1');
    //     $response->assertStatus(200);
    // }

    // public function test_signature_step_returns_200()
    // {
    //     $response = $this->get('/workflows/signature-capture/steps/1');
    //     $response->assertStatus(200);
    // }

    // public function test_workflow_login_form_returns_200()
    // {
    //     $response = $this->get('/workflows/login');
    //     $response->assertStatus(200);
    // }
// }

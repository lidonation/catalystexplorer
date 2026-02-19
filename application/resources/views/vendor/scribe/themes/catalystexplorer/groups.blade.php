@foreach($groupedEndpoints as $groupName => $endpoints)
<h2 id="{{ \Knuckles\Scribe\Tools\WritingUtils::slugify($groupName) }}" class="text-2xl font-bold text-content border-b border-border-secondary pb-4 mb-8 mt-12">
    {{ $groupName }}
</h2>

@foreach($endpoints as $endpoint)
    @include("scribe::themes.catalystexplorer.endpoint", compact('endpoint'))
@endforeach

@endforeach
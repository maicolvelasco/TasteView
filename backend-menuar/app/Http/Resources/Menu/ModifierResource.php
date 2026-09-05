<?php

declare(strict_types=1);

namespace App\Http\Resources\Menu;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ModifierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'min_selections' => $this->pivot->min_selections ?? $this->min_selections,
            'max_selections' => $this->pivot->max_selections ?? $this->max_selections,
            'is_required' => $this->pivot->is_required ?? false,
            'options' => OptionResource::collection($this->visibleOptions()),
        ];
    }

    /**
     * Opciones visibles para este producto puntual: activas y no
     * deshabilitadas específicamente vía el pivot producto-modificador.
     * Se filtra en memoria (la colección ya viene eager-loaded) para no
     * disparar una query extra por cada modificador.
     */
    private function visibleOptions()
    {
        $disabledIds = $this->pivot->disabled_option_ids ?? [];

        return $this->options
            ->filter(fn ($option) => $option->is_active && !in_array($option->id, $disabledIds, true))
            ->values();
    }
}
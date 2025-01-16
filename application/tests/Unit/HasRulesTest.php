<?php

declare(strict_types=1);

use App\Enums\LogicalOperators;
use App\Enums\Operators;
use App\Models\Metric;
use Illuminate\Database\Eloquent\Builder;

it('applies AND rules correctly', function () {
    $mockBuilder = $this->createPartialMock(Builder::class, ['where']);
    $mockQuery = $this->createPartialMock(Builder::class, ['where', '__call']);

    $mockQuery->method('__call')
        ->willReturnCallback(function ($method, $args) use ($mockQuery) {
            if (($method === 'whereNull' || $method === 'whereNotNull') && $args[0] === 'funded_at') {
                return $mockQuery;
            }
            throw new \Exception("Unexpected method call: $method");
        });

    $mockQuery->expects($this->once())
        ->method('where')
        ->with('amount', '>', 1000)
        ->willReturn($mockQuery);

    $mockBuilder->expects($this->once())
        ->method('where')
        ->with($this->callback(function ($callback) use ($mockQuery) {
            $callback($mockQuery);

            return true;
        }));

    $metric = new Metric;
    $rules = collect([
        (object) [
            'logical_operator' => LogicalOperators::AND(),
            'subject' => 'funded_at',
            'operator' => Operators::IS_NULL(),
            'predicate' => null,
        ],
        (object) [
            'logical_operator' => LogicalOperators::AND(),
            'subject' => 'amount',
            'operator' => '>',
            'predicate' => 1000,
        ],
    ]);

    $metric->applyRules($mockBuilder, $rules);
});

it('applies OR rules correctly', function () {
    $mockBuilder = $this->createPartialMock(Builder::class, ['orWhere']);
    $mockQuery = $this->createPartialMock(Builder::class, ['where', '__call']);

    $mockQuery->method('__call')
        ->willReturnCallback(function ($method, $args) use ($mockQuery) {
            if (($method === 'whereNull' || $method === 'whereNotNull') && $args[0] === 'funded_at') {
                return $mockQuery;
            }
            throw new \Exception("Unexpected method call: $method");
        });

    $mockQuery->expects($this->once())
        ->method('where')
        ->with('amount', '=', 500)
        ->willReturn($mockQuery);

    $mockBuilder->expects($this->once())
        ->method('orWhere')
        ->with($this->callback(function ($callback) use ($mockQuery) {
            $callback($mockQuery);

            return true;
        }));

    $metric = new Metric;
    $rules = collect([
        (object) [
            'logical_operator' => LogicalOperators::OR(),
            'subject' => 'funded_at',
            'operator' => Operators::IS_NOT_NULL(),
            'predicate' => null,
        ],
        (object) [
            'logical_operator' => LogicalOperators::OR(),
            'subject' => 'amount',
            'operator' => '=',
            'predicate' => 500,
        ],
    ]);

    $metric->applyRules($mockBuilder, $rules);
});

it('applies multiple AND and OR rules correctly', function () {
    $mockBuilder = $this->createPartialMock(Builder::class, ['where', 'orWhere']);
    $mockAndQuery = $this->createPartialMock(Builder::class, ['where', '__call']);
    $mockOrQuery = $this->createPartialMock(Builder::class, ['where']);

    $mockAndQuery->method('__call')
        ->willReturnCallback(function ($method, $args) use ($mockAndQuery) {
            if (($method === 'whereNull' || $method === 'whereNotNull') && $args[0] === 'funded_at') {
                return $mockAndQuery;
            }
            throw new \Exception("Unexpected method call: $method");
        });

    $mockAndQuery->expects($this->once())
        ->method('where')
        ->with('amount', '>', 1000)
        ->willReturn($mockAndQuery);

    $mockOrQuery->expects($this->exactly(2))
        ->method('where')
        ->willReturnCallback(function ($field, $operator, $value) use ($mockOrQuery) {
            static $callCount = 0;
            $expectations = [
                ['status', '=', 'approved'],
                ['type', '=', 'urgent'],
            ];

            if ($field === $expectations[$callCount][0] &&
                $operator === $expectations[$callCount][1] &&
                $value === $expectations[$callCount][2]) {
                $callCount++;

                return $mockOrQuery;
            }
            throw new \Exception("Unexpected arguments for call $callCount");
        });

    $mockBuilder->expects($this->once())
        ->method('where')
        ->with($this->callback(function ($callback) use ($mockAndQuery) {
            $callback($mockAndQuery);

            return true;
        }));

    $mockBuilder->expects($this->once())
        ->method('orWhere')
        ->with($this->callback(function ($callback) use ($mockOrQuery) {
            $callback($mockOrQuery);

            return true;
        }));

    $metric = new Metric;
    $rules = collect([
        (object) [
            'logical_operator' => LogicalOperators::AND(),
            'subject' => 'funded_at',
            'operator' => Operators::IS_NULL(),
            'predicate' => null,
        ],
        (object) [
            'logical_operator' => LogicalOperators::AND(),
            'subject' => 'amount',
            'operator' => '>',
            'predicate' => 1000,
        ],
        (object) [
            'logical_operator' => LogicalOperators::OR(),
            'subject' => 'status',
            'operator' => '=',
            'predicate' => 'approved',
        ],
        (object) [
            'logical_operator' => LogicalOperators::OR(),
            'subject' => 'type',
            'operator' => '=',
            'predicate' => 'urgent',
        ],
    ]);

    $metric->applyRules($mockBuilder, $rules);
});

it('handles empty rules gracefully', function () {
    $mockBuilder = $this->createPartialMock(Builder::class, ['where', 'orWhere']);

    $mockBuilder->expects($this->never())->method('where');
    $mockBuilder->expects($this->never())->method('orWhere');

    $metric = new Metric;
    $rules = collect();

    $metric->applyRules($mockBuilder, $rules);
});

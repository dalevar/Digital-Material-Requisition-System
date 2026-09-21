<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role?->name, $roles)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized access for your role.'], 403);
            }
            abort(403, 'Unauthorized access for your role.');
        }

        return $next($request);
    }
}

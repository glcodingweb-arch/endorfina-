"use client";

function Stick(baseClasses: string, childClasses?: string) {
  return (
    <div className={baseClasses}>
      {childClasses && <div className={childClasses}></div>}
    </div>
  );
}

export function EmptyCartIllustration() {
  return (
    <div className="relative mx-auto mb-8 inline-block h-64 w-64 overflow-hidden rounded-full bg-muted">
      {/* Chão */}
      <div className="absolute bottom-0 h-1/2 w-full bg-background" />

      {/* Carrinho principal */}
      <div className="absolute bottom-16 left-1/2 h-20 w-5 -translate-x-1/2 rounded-t-md bg-muted-foreground z-10">
        {/* Rodas do carrinho */}
        {Stick(
          "absolute -left-4 top-8 h-4 w-8 rounded-full bg-inherit",
          "absolute -right-2 top-0 h-8 w-4 rounded-t-md bg-inherit"
        )}
        {Stick(
          "absolute -right-4 top-12 h-4 w-8 rounded-full bg-inherit",
          "absolute -left-2 top-0 h-8 w-4 rounded-t-md bg-inherit"
        )}
      </div>

      {/* Barras secundárias (perspectiva / profundidade) */}
      {Stick(
        "absolute bottom-16 left-1/3 h-16 w-4 -translate-x-1/2 scale-75 rounded-t-md bg-muted-foreground/70 z-0",
        "absolute -left-3 top-6 h-3 w-6 rounded-full bg-inherit"
      )}
      {Stick(
        "absolute bottom-16 right-1/4 h-12 w-4 -translate-x-1/2 scale-50 rounded-t-md bg-muted-foreground/50 z-0",
        "absolute -right-3 top-4 h-3 w-6 rounded-full bg-inherit"
      )}

      {/* Sol / detalhe visual */}
      <div className="absolute top-8 left-8 h-8 w-8 rounded-full bg-yellow-300" />
    </div>
  );
}

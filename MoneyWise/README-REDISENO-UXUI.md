# MoneyWise - Rediseño UX/UI

## Cómo aplicar

1. Haz una copia de seguridad de tu proyecto actual.
2. Descomprime este ZIP en la raíz de tu proyecto MoneyWise.
3. Acepta reemplazar los archivos existentes.
4. Ejecuta:

```bash
npm install
ionic serve
```

Para compilar Android después de validar en navegador:

```bash
ionic build
npx cap sync android
npx cap open android
```

## Archivos modificados

- `src/theme/variables.scss`: nuevo sistema visual con tokens dark/light, sombras, radios, gradientes y mapeo Ionic.
- `src/global.scss`: estilos globales, headers, tabs, botones, campos, cards, segmentos, searchbar, datetime y accesibilidad.
- `src/app/auth/login/login.page.html`
- `src/app/auth/login/login.page.scss`
- `src/app/auth/register/register.page.html`
- `src/app/auth/register/register.page.scss`
- `src/app/dashboard/dashboard/dashboard.page.html`
- `src/app/dashboard/dashboard/dashboard.page.scss`
- `src/app/dashboard/dashboard/dashboard.page.ts`
- `src/app/transacciones/lista/lista-transacciones.page.html`
- `src/app/transacciones/lista/lista-transacciones.page.scss`
- `src/app/transacciones/detalle/detalle-transaccion.page.html`
- `src/app/transacciones/detalle/detalle-transaccion.page.scss`
- `src/app/usuario/usuario.page.html`
- `src/app/usuario/usuario.page.scss`
- `src/app/tabs/tabs.page.scss`
- `src/app/home/home.page.html`
- `src/app/home/home.page.scss`
- `src/app/shared/components/dashboard-card/dashboard-card.component.html`
- `src/app/shared/components/dashboard-card/dashboard-card.component.scss`
- `src/app/shared/components/dashboard-card/dashboard-card.component.ts`
- `src/app/shared/components/filter-bar/filter-bar.component.html`
- `src/app/shared/components/filter-bar/filter-bar.component.scss`
- `src/app/shared/components/filter-bar/filter-bar.component.ts`
- `src/app/shared/components/transaction-item/transaction-item.component.html`
- `src/app/shared/components/transaction-item/transaction-item.component.scss`
- `src/app/shared/components/transaction-item/transaction-item.component.ts`
- `src/app/shared/components/empty-state/empty-state.component.html`
- `src/app/shared/components/empty-state/empty-state.component.scss`
- `src/app/shared/components/empty-state/empty-state.component.ts`
- `src/app/shared/components/progress-bar-category/progress-bar-category.component.scss`
- `src/app/shared/components/progress-bar-category/progress-bar-category.component.ts`
- `src/app/shared/components/transaction-form/transaction-form.component.html`
- `src/app/shared/components/transaction-form/transaction-form.component.scss`
- `src/app/shared/components/transaction-form/transaction-form.component.ts`
- `src/app/shared/components/transaction-detail/transaction-detail.component.html`
- `src/app/shared/components/transaction-detail/transaction-detail.component.scss`
- `src/app/shared/components/transaction-detail/transaction-detail.component.ts`
- `src/app/shared/components/pie-chart/pie-chart.component.scss`

## Nota técnica

Se agregó `styleUrls` a componentes compartidos que ya tenían `.scss`, porque sin esa propiedad Angular no carga esos estilos de componente. Esto es clave para que el rediseño no dependa solo de CSS global.

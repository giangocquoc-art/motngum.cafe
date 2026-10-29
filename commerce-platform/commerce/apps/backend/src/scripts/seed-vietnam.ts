/**
 * Vietnam locale bootstrap for disposable staging merchants.
 * Adapted from the official Medusa starter's updateStoreCurrencies workflow.
 * Adds VND as default, Vietnam region and tax jurisdiction using Medusa workflows.
 * Does NOT configure a real PSP, shipping carrier, tax rate, or actual merchant account.
 * Run after migrations: pnpm medusa exec ./src/scripts/seed-vietnam.ts
 */
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createRegionsWorkflow, createTaxRegionsWorkflow, updateStoresStep, updateStoresWorkflow } from "@medusajs/medusa/core-flows"

const updateStoreCurrencies = createWorkflow("motngum-update-store-currencies", (input: {
  supported_currencies: { currency_code: string; is_default?: boolean }[],
  store_id: string
}) => {
  const normalizedInput = transform({ input }, (data) => ({
    selector: { id: data.input.store_id },
    update: { supported_currencies: data.input.supported_currencies.map(c => ({
      currency_code: c.currency_code, is_default: c.is_default ?? false
    })) }
  }))
  const stores = updateStoresStep(normalizedInput)
  return new WorkflowResponse(stores)
})

export default async function seedVietnam({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: stores } = await query.graph({
    entity: "store", fields: ["id", "supported_currencies.currency_code", "supported_currencies.is_default"]
  })
  if (stores.length !== 1) throw new Error("Expected exactly one tenant store; do not seed a multi-merchant shared backend")
  const store = stores[0]
  const currencies = (store.supported_currencies || [])
    .filter(c => c.currency_code !== "vnd")
    .map(c => ({ currency_code: c.currency_code, is_default: false }))
  await updateStoreCurrencies(container).run({
    input: { store_id: store.id, supported_currencies: [...currencies, { currency_code: "vnd", is_default: true }] }
  })

  const { data: regions } = await query.graph({ entity: "region", fields: ["id", "name", "currency_code"] })
  let vietnam = regions.find(r => r.name === "Việt Nam" && r.currency_code === "vnd")
  if (!vietnam) {
    const { result } = await createRegionsWorkflow(container).run({
      input: { regions: [{ name: "Việt Nam", currency_code: "vnd", countries: ["vn"], payment_providers: ["pp_system_default"] }] }
    })
    vietnam = result[0]
  }
  if (!vietnam) throw new Error("Failed to create Vietnam region")

  const { data: taxes } = await query.graph({ entity: "tax_region", fields: ["id", "country_code"] })
  if (!taxes.some(t => t.country_code === "vn")) {
    await createTaxRegionsWorkflow(container).run({ input: [{ country_code: "vn", provider_id: "tp_system" }] })
  }
  await updateStoresWorkflow(container).run({
    input: { selector: { id: store.id }, update: { default_region_id: vietnam.id } }
  })
  logger.info("Vietnam region configured using VND; live payment, tax rates and shipping integrations are NOT configured.")
}

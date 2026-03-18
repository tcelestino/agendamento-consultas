export async function getAddress(zipCode: string) {
  const response = await fetch(
    `${import.meta.env.VITE_AGENDAMENTO_API}/api/v1/infos/address/${zipCode}/`,
  )

  if (!response.ok) {
    throw new Error('Erro ao buscar endereço')
  }

  const { street, neighborhood, city, state, stateCode } = await response.json()

  return { street, neighborhood, city, state, stateCode }
}

export function reverseDate(date: string) {
  return date.split('-').reverse().join('/')
}

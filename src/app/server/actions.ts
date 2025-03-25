'use server'

/**
 * ! The server actions below are used to fetch the static data from the fake-db. If you're using an ORM
 * ! (Object-Relational Mapping) or a database, you can swap the code below with your own database queries.
 */

// Data Imports
import { db as eCommerceData } from '../../fake-db/apps/ecommerce'

export const getEcommerceData = async () => {
  return eCommerceData
}

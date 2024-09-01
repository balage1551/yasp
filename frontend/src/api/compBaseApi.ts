import { request } from '@/utils/request'
import { TableOptions } from '@/api/baseApi'
import { Optional } from '@/utils/typeScriptUtils'

export type ItemWithId = {
  id: number
}

export default function useBaseApi<T extends ItemWithId>(itemName: string) {
  function getName() {
    return itemName
  }

  function getItem(itemId: number): Promise<T> {
    return request({
      url: `/${itemName}/${itemId}`,
      method: 'get',
    })
  }

  function saveItem(item : T) : Promise<T> {
    return request({
      url: item.id ? `/${itemName}/update` : `/${itemName}/create`,
      method: item.id ? 'put' : 'post',
      data: item,
    })
  }

  function deleteItem(itemId: number) : Promise<T> {
    return request({
      url: `/${itemName}/delete/${itemId}`,
      method: 'put',
    })
  }

  function restoreItem(itemId: number) : Promise<T> {
    return request({
      url: `/${itemName}/restore/${itemId}`,
      method: 'put',
    })
  }

  function getItems(tableOptions : Optional<TableOptions> = undefined, tableFilters = {}) : Promise<T[]> {
    if (tableOptions) {
      return request({
        url: `/${itemName}/list`,
        method: 'get',
        params: {
          page: tableOptions.page - 1,
          itemsPerPage: tableOptions.itemsPerPage,
          sortBy: tableOptions.sortBy[0],
          sortDesc: tableOptions.sortDesc[0],
          ...tableFilters,
        },
      })
    } else {
      return request({
        url: `/${itemName}/list`,
        method: 'get',
      })
    }
  }

  return {
    getName,
    saveItem,
    getItem,
    getItems,
    deleteItem,
    restoreItem
  }
}
//
// export interface TableOptions {
//   page: number;
//   itemsPerPage: number;
//   sortBy: string[];
//   sortDesc: boolean[];
// }
//
// interface BaseApi<T extends ItemWithId> {
//     saveItem(item: T): Promise<unknown>;
//     deleteItem(itemId: string): Promise<unknown>;
//     restoreItem(itemId: string): Promise<unknown>;
//     getItems(tableOptions?: TableOptions, tableFilters?: Record<string, unknown>): Promise<unknown>;
//     getItem(itemId: string): Promise<unknown>;
// }
//
// export const baseApi = <T extends ItemWithId>(itemName: string, extension: Record<string, unknown> = {}): BaseApi<T> => {
//   return {
//     ...extension,
//     saveItem (item) {
//       return request({
//         url: item.id ? `/${itemName}/update` : `/${itemName}/create`,
//         method: item.id ? 'put' : 'post',
//         data: item,
//       })
//     },
//
//     deleteItem (itemId) {
//       return request({
//         url: `/${itemName}/delete/${itemId}`,
//         method: 'put',
//       })
//     },
//
//     restoreItem (itemId) {
//       return request({
//         url: `/${itemName}/restore/${itemId}`,
//         method: 'put',
//       })
//     },
//
//     getItems (tableOptions : TableOptions, tableFilters = {}) {
//       if (tableOptions) {
//         return request({
//           url: `/${itemName}/list`,
//           method: 'get',
//           params: {
//             page: tableOptions.page - 1,
//             itemsPerPage: tableOptions.itemsPerPage,
//             sortBy: tableOptions.sortBy[0],
//             sortDesc: tableOptions.sortDesc[0],
//             ...tableFilters,
//           },
//         })
//       } else {
//         return request({
//           url: `/${itemName}/list`,
//           method: 'get',
//         })
//       }
//     },
//
//     getItem (itemId) {
//       return request({
//         url: `/${itemName}/${itemId}`,
//         method: 'get',
//       })
//     },
//   }
// }

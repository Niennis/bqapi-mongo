
// IDENTIFY IF INPUT IS EMAIL OR ID
module.exports.getIdOrEmail = (input) => {
  if (input.indexOf('@') > 0) {
    return ({ email: input })
  }
  if (!mongoose.Types.ObjectId.isValid(input)) {
    throw new Error('ID inválido')
  }
  return ({ _id: input })

}

module.exports.pagination = (uri, count, page, limit) => {
  let firstPage = `<${uri}page=${page > 1 ? 1 : page}&limit=${limit}>; rel="first"`;
  let lastPage = `<${uri}page=${Math.ceil(count / limit) < 1 ? 1 : Math.ceil(count / limit)}&limit=${limit}>; rel="last"`;
  let prevPage = `<${uri}page=${1 < page ? page - 1 : 1}&limit=${limit}>; rel="prev"`;
  let nextPage = `<${uri}page=${(parseInt(count / limit) + 1) > page ? parseInt(page) + 1 : (parseInt(count / limit) + 1)}limit=${limit}>; rel="next"`;

  return `${firstPage}, ${lastPage}, ${prevPage}, ${nextPage}`
}


// const link = {
//   first: `<${uri}page=${page > 1 ? 1 : page}&limit=${limit}>; rel="first"`,
//   last: `<${uri}page=${Math.ceil(count / limit) < 1 ? 1 : Math.ceil(count / limit)}&limit=${limit}>; rel="last"`,
//   prev: `<${uri}page=${1 < page ? page - 1 : 1}&limit=${limit}>; rel="prev"`,
//   next: `<${uri}page=${(parseInt(count / limit) + 1) > page ? parseInt(page) + 1 : (parseInt(count / limit) + 1)}limit=${limit}>; rel="next"`,

// }
// return link
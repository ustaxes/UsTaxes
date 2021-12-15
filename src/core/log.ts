import log from 'loglevel'

const { TRACE, ERROR } = log.levels

log.setDefaultLevel(process.env.NODE_ENV === 'development' ? TRACE : ERROR)

export default log

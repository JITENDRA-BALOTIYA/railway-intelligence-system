export const validateTrainNumber = (req) => {
  const { trainNumber } = req.params
  if (!trainNumber) {
    return { error: { message: 'Train number is required' } }
  }

  const clean = String(trainNumber).trim()
  if (!/^[0-9A-Za-z-]{3,10}$/.test(clean)) {
    return { error: { message: 'Invalid train number format. Must be 3 to 10 alphanumeric characters.' } }
  }

  return { value: clean }
}

export const validateStationCode = (req) => {
  const { stationCode } = req.params
  if (!stationCode) {
    return { error: { message: 'Station code is required' } }
  }

  const clean = String(stationCode).trim().toUpperCase()
  if (!/^[A-Z]{2,6}$/.test(clean)) {
    return { error: { message: 'Invalid station code format. Must be 2 to 6 uppercase letters.' } }
  }

  return { value: clean }
}

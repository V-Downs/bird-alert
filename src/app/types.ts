type RescueStatus = 'Pending' | 'In Route' | 'Rescued' | 'Delivered'
type RTLevel = 'Green: songbirds & babies' | 'Yellow: geese, ducks and swans' | 'Red: herons, bats' | 'Purple: raptors';

interface Bird {
    id: string,
    species: string,
    location: string,
    destination: string,
    status: RescueStatus,
    rtLevel: RTLevel,
    currentVolunteer: string,
    photo: { url: string, width: number, height: number },
}


import {
    MapPinIcon,
    HomeIcon,
    ArrowLeftIcon,
    XIcon,
    CircleUser
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import Airtable from 'airtable'

export default function RescueDetails({ rescue, onBack, selectedRescue, setSelectedRescue, fetchBirdRescues }: { rescue: BirdAlert, onBack: () => void, selectedRescue: any, setSelectedRescue: any, fetchBirdRescues: any }) {
    //state variables
    const [birdRescues, setBirdRescues] = useState<BirdAlert[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAcceptForm, setShowAcceptForm] = useState(false)
    const [rescuerName, setRescuerName] = useState('')
    const [localRescuerName, setLocalRescuerName] = useState(rescuerName)
    const [formError, setFormError] = useState<string | null>(null)
    const [volunteers, setVolunteers] = useState<any[]>([])

    //connecting to airtable
    const airtable = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN })
    const base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

    // colors for the statuses that correpond to the airtable colors in the 'VolunteerStatus' column
    const getStatusColor = (status: RescueStatus) => {
        switch (status) {
          case 'Pending': return 'bg-rose-600 hover:bg-rose-800'
          case 'In Route': return 'bg-amber-600 hover:bg-amber-800'
          case 'Rescued': return 'bg-violet-700 hover:bg-violet-800'
          case 'Delivered': return 'bg-teal-700 hover:bg-teal-800'
        }
      }

      const getRTLevelColor = (level: RTLevel) => {
          switch (level) {
              case 'Green: songbirds & babies': return 'bg-green-600'
              case 'Yellow: geese, ducks and swans': return 'bg-yellow-600'
              case 'Red: herons, bats': return 'bg-red-600'
              case 'Purple: raptors': return 'bg-purple-600'
          }
      }

      //Change status of VolunteerStatus
      const handleStatusChange = async (newStatus: RescueStatus) => {

        if (selectedRescue) {
          setIsLoading(true)
          try {
            const updatedFields = { VolunteerStatus: newStatus }

            if (newStatus === 'Pending') {
              setShowAcceptForm(true)
              setIsLoading(false)
              return
            }

            // update airtable column
            if (selectedRescue.currentVolunteer) {
              await updateRescueInAirtable(selectedRescue.id, updatedFields)
            }

            // update the bird in BirdAlertList so that it has the new status
            const updatedBird = {
              ...selectedRescue,
              ...updatedFields,
            }
            setBirdRescues(birdRescues.map((bird: { id: any }) =>
              bird.id === selectedRescue.id ? updatedBird : bird
            ))
            setSelectedRescue(updatedBird)

          } catch (error) {
            console.error('Error updating bird rescue status:', error)
            setError('Failed to update rescue status. Please try again.')
          }
          setIsLoading(false)
          if (newStatus !== "In Route") {
            setSelectedRescue(null)
          }

          fetchBirdRescues()
        }

      }

      function handleAcceptClick() {
        setShowAcceptForm(true)
        handleStatusChange('In Route');
      }

    const handleSubmit = async (e: React.FormEvent) => {

        const fields = {CurrentVolunteer: localRescuerName, VolunteerStatus: "In Route"}
        try {
            const updatedRecords = await base('Bird Alerts').update([
                {
                    id: selectedRescue.id,
                    fields: fields
                }
            ])
            setShowAcceptForm(false)
            return updatedRecords
        }catch {
            throw error
        }
    }

      // get volunteers based off of the PossibleVolunteers column
    const fetchVolunteers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const records = await base('Rescue and Transport Team').select().all()
        const volunteers = records.map((record: any) => ({
          id: record.get('_id') as string,
          name: record.get('Name') as string
        }))
        setVolunteers(volunteers)
      } catch (error) {
        console.error('Error fetching bird rescues:', error)
        setError('Failed to fetch bird rescues. Please try again later.')
      }
      setIsLoading(false)
    }


    function acceptForm( ) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAcceptForm(false)}>
            <Card className="w-full max-w-md " onClick={(e) => e.stopPropagation()}>
            <CardHeader>
                <div className="flex justify-between items-center">
                <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Accept Rescue</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowAcceptForm(false)}>
                    <XIcon className="h-4 w-4" />
                </Button>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label className="block mb-2 text-sm font-medium text-gray-900"> Your Name</Label>
                    <select required onChange={(e) => setLocalRescuerName(e.target.value)} name='name'
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" >
                      <option value={""}>-- Please Pick Your Name</option>
                        {populateNameOptions()}
                    </select>
                </div>
                {formError && (
                    <div className="text-red-500 text-sm">{formError}</div>
                )}
                <Button disabled={localRescuerName ? false : true}  type="submit" className="w-full bg-lime-600 hover:bg-lime-700 text-white">
                    Accept Rescue
                </Button>
                </form>
            </CardContent>
            </Card>
        </div>
        )
    }

      // this is what actually populates the list
      function populateNameOptions() {
        const volunteerOptions = volunteers.filter((vol: { id: string }) => selectedRescue.possibleVolunteers.includes(vol.id))
        const volunteerOptionElements = volunteerOptions.map((vol: { id: string , name: string}, index: number) => {
          return (
              <option key={index} value={vol.name}>
                    {vol.name}
                </option>
            )
        })

        return volunteerOptionElements
      }

      const updateRescueInAirtable = async (id: string, fields: any) => {
        try {
          const updatedRecords = await base('Bird Alerts').update([
            {
              id,
              fields: fields
            }
          ])
          console.log('Airtable update response:', updatedRecords)
          return updatedRecords
        } catch (error) {
          console.error('Error updating Airtable:', error)
          throw error
        }
      }

    useEffect(() => {
        fetchVolunteers()
    }, [])

    return (
      <div className="p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </div>

        <Card className="border shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-stone-100 border-b border-stone-200 px-4 py-2">
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <span className="font-medium text-xl text-stone-700">{rescue.species}</span>
              </div>
              <Badge variant="secondary" className={`${getStatusColor(rescue.status)} text-white`}>
                {rescue.status}
              </Badge>
            </div>
          </CardHeader>
            <CardContent className="px-4 py-4 space-y-4">
                <img
                    src={rescue.photo['url']}
                    width={rescue.photo['width']}
                    height={rescue.photo['height']}
                    alt={rescue.species}
                    className="rounded-md shadow-md w-full lg:w-2/4 float-left lg:mr-8
                    lg:mb-8"/>
                <Badge variant="secondary" className={`${getRTLevelColor(rescue.rtLevel)} text-white`}>
                    {rescue.rtLevel}
                </Badge>

                <div className="space-y-4">
                    Technical Skills:
                    <ul>
                        {rescue.skills?.map((skill, index) => <li key={index}>{skill}</li>)}
                    </ul>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
                        <div className="flex items-center overflow-hidden">
                            <MapPinIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                            <a href={`https://maps.google.com/?q=${rescue.location}`} target='_blank' rel="noopener noreferrer" className="font-medium text-lime-600 dark:text-lime-500 hover:underline">
                <span className="float-left truncate hover:underline">{rescue.location}</span>
                </a>
                </div>
                    </div>
                    <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
                        <div className="flex items-center overflow-hidden">
                            <HomeIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500"/>
                            <a href={`https://maps.google.com/?q=${rescue.destination}`} target='_blank' rel="noopener noreferrer" className="font-medium text-lime-600 dark:text-lime-500 hover:underline">
                            <span className="float-left truncate hover:underline">{rescue.destination}</span>
                </a>
                </div>

              </div>
              <div className="flex items-center bg-stone-50 p-3 rounded-md">
                <CircleUser className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
                <span>Current Volunteer: <span className='bold-text'>{rescue.currentVolunteer ? rescue.currentVolunteer : "AVAILABLE"}</span> </span>

                    </div>
                </div>
                <div className="space-y-4">
                    {
                        showAcceptForm &&
                        acceptForm()
                    }
                    {rescue.status === 'Pending' && (
                        <Button
                            className="w-full bg-lime-600 hover:bg-lime-700 text-white transition-colors duration-200"
                            onClick={handleAcceptClick}>
                            Accept Rescue
                        </Button>
                    )}
                    {rescue.status === 'In Route' && (
                        <Button className="w-full bg-red-700 hover:bg-red-800 text-white transition-colors duration-200"
                                onClick={() => handleStatusChange('Rescued')}>
                            Mark as rescued
                        </Button>
                    )}
                    {rescue.status === 'Rescued' && (
                        <Button
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white transition-colors duration-200"
                            onClick={() => handleStatusChange('Delivered')}>
                            Mark as Delivered
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    )
}

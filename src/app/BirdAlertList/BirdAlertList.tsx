'use client'

import {
    MapPinIcon,
    HomeIcon,
    ChevronsUpDown, UserCircle, PhoneIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import RescueDetails from '../RescueDetails/RescueDetails'
import Airtable from 'airtable'
import Image from 'next/image'
import {Checkbox} from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {cn} from "@/lib/utils";

export default function BirdAlertList() {
    // creates the variables needed to set up the bird alert list
    const [birdRescues, setBirdRescues] = useState<BirdAlert[]>([])
    const [selectedRescue, setSelectedRescue] = useState<BirdAlert | null>(null)
    const allStatuses = ['Pending', 'In Route', 'Rescued', 'Delivered'] as RescueStatus[];
    const [value, setValue] = useState(new Set<RescueStatus>(['Pending', 'In Route', 'Rescued']))
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [isFilterOpen, setIsFilterIsFilterOpen] = useState(false)

    // connection to airtable and the Bird Alert table.
    const airtable = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN })
    const base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

    // colors for status
    const getStatusColor = (status: RescueStatus) => {
        switch (status) {
          case 'Pending': return 'bg-rose-600 hover:bg-rose-800'
          case 'In Route': return 'bg-amber-600 hover:bg-amber-800'
          case 'Rescued': return 'bg-violet-700 hover:bg-violet-800'
          case 'Delivered': return 'bg-teal-700'
        }
      }

      // this function collects the records from airtable and converts them to type 'Bird'
      const fetchBirdRescues = async () => {
        setIsLoading(true)
        setError(null)
        try {
          // airtable fetch
          const records = await base('Bird Alerts').select().all()

          //conversion
          const rescues: BirdAlert[] = records.map((record) => ({
            id: record.get('_id') as string,
            species: record.get('Type of Bird') as string,
            location: record.get('Full Pick Up Address') as string,
            destination: record.get('Drop Off Address') as string,
            status: record.get('VolunteerStatus') as RescueStatus,
            rtLevel: record.get('R&T Level') as RTLevel,
            skills: record.get('Technical Skills') as Skills[],
            possibleVolunteers: record.get("Possible Volunteers") as object[],
            currentVolunteer: record.get("CurrentVolunteer") as string,
            photo: record.get('Bird Photo') ? ((record.get('Bird Photo') as object[])[0] as { url: string, width: number, height: number }) : {}as { url: string, width: number, height: number },
          }))

          //sets state variable
          setBirdRescues(rescues)
        } catch (error) {
          console.error('Error fetching bird rescues:', error)
          setError('Failed to fetch bird rescues. Please try again later.')
        }
        setIsLoading(false)
      }


    useEffect(() => {
    fetchBirdRescues()
    }, [])

    return (
        <div>
      <Card className="bg-fill bg-center text-white rounded-none" style={{ backgroundImage: "url('../images/birds.jpg')" }}>

          <CardTitle className="text-2xl font-bold px-6 pt-12"><Image
            src="/images/logo.png"
            width={70}
            height={70}
            className={"float-left pr-2"}
            alt="Iowa Bird Rehabilitation Logo"
          />
            Iowa Bird Rehabilitation</CardTitle>
        <CardContent>
          <div className="flex items-center text-sm text-stone-300 pb-6">
            <span>Creating a future for our feathered friends.</span>
          </div>
        </CardContent>
      </Card>
      <div>
      {selectedRescue ? (
        <RescueDetails rescue={selectedRescue} onBack={() => setSelectedRescue(null)} selectedRescue={selectedRescue} setSelectedRescue={setSelectedRescue} fetchBirdRescues={fetchBirdRescues}/>
      ) : (
        <Card className="overflow-hidden border-none shadow-none bg-stone-100">
          <CardHeader className="">
            <CardTitle className="text-lg font-semibold text-stone-800 pt-4">
                Available Rescues
                <Popover open={isFilterOpen} onOpenChange={setIsFilterIsFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isFilterOpen}
                            className=" mt-2 w-full justify-between"
                        >
                            {value
                                ? Array.from(value).join(',')
                                : "Select framework..."}
                            <ChevronsUpDown className="ml-2 h-4 w-8 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="sm:w-[500px] p-0">
                        <Command>
                            <CommandInput placeholder="Select statuses..." />
                            <CommandList>
                                <CommandEmpty>No statuses found.</CommandEmpty>
                                <CommandGroup>
                                    {allStatuses.map((framework) => (
                                        <CommandItem
                                            key={framework}
                                            onSelect={(currentValue: any) => {
                                                    const newValue = new Set(value)
                                                    if (newValue.has(framework)) {
                                                        newValue.delete(framework)
                                                    } else {
                                                        newValue.add(framework)
                                                    }
                                                    setValue(newValue)
                                            }}
                                        >
                                            <Checkbox
                                                checked={value.has(framework)}
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                )}
                                            />
                                            {framework}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            <CommandItem>
                                <Button onClick={() => setIsFilterIsFilterOpen(false)}>Done</Button>
                            </CommandItem>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-t-2 border-lime-500 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-32 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:auto-cols-max md:grid-cols-2 lg:grid-cols-3">
                {birdRescues.filter(bird =>
                  value.has(bird.status)
                ).sort((a, b) => {
                    // Show pending rescues first
                    return allStatuses.indexOf(a.status) < allStatuses.indexOf(b.status) ? -1 : 1;
                }).map(rescue => (
                  <Card key={rescue.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg font-semibold">{rescue.species}</CardTitle>
                        </div>
                        <Badge variant="secondary" className={`${getStatusColor(rescue.status)} text-white h-10`}>
                          {rescue.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-stone-600">
                          <MapPinIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{rescue.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-stone-600">
                          <HomeIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{rescue.destination}</span>
                        </div>
                        <div className="flex items-center text-sm text-stone-600">
                          <UserCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>Current Volunteer: <span className='bold-text'>{rescue.currentVolunteer ? rescue.currentVolunteer : "AVAILABLE"}</span> </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-stone-50 p-4">
                      <Button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:text-accent-foreground h-9 px-4 py-2 w-full bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out text-black"
                        onClick={() => setSelectedRescue(rescue)}
                      >
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>

            <Card key="emergency" className="rounded-xl border text-card-foreground overflow-hidden border-none shadow-none bg-stone-100">
                <CardHeader className="p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <CardTitle className="text-lg font-semibold">Emergency</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    If you're having an emergency with a bird rescue, call us.
                </CardContent>
                <CardFooter className="bg-stone-50 p-4">
                    <a href="tel:5152075008"
                       className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:text-accent-foreground h-9 px-4 py-2 w-full bg-red-600 hover:bg-red-300 transition-colors duration-200 ease-in-out text-white"
                    >
                        <PhoneIcon className="mr-2"/> Call
                    </a>
                </CardFooter>
            </Card>
    </div>
    )
}

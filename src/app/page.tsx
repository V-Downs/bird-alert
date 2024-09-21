'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon, BirdIcon, TruckIcon, HomeIcon, CheckCircleIcon, MoreHorizontalIcon, UserIcon, ListIcon, MapIcon, ArrowLeftIcon, NavigationIcon, ChevronUpIcon, ChevronDownIcon, ShieldIcon, FilterIcon, XIcon, Router, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Airtable from 'airtable'
import { useRouter } from "next/navigation";
import Link from 'next/link'
import BirdAlertList from './BirdAlertList/page'


type RescueStatus = 'Pending' | 'In Route' | 'Rescued' | 'Delivered'

interface Bird {
  id: string,
  species: string,
  location: string,
  destination: string,
  status: RescueStatus,
  rescuerName: string
}

// Initialize Airtable
const airtable = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN })
const base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

export default function BirdRescueApp() {
  const [location, setLocation] = useState<string>('Des Moines, IA')
  const [birdRescues, setBirdRescues] = useState<Bird[]>([])
  const [selectedRescue, setSelectedRescue] = useState<Bird | null>(null)
  const [activeView, setActiveView] = useState<'list' | 'admin'>('list')
  const [selectedStatuses, setSelectedStatuses] = useState<RescueStatus[]>(['Pending', 'In Route', 'Rescued', 'Delivered'])
  // const [selectedBirdTypes, setSelectedBirdTypes] = useState<BirdType[]>(['Songbird', 'Raptor', 'Waterfowl', 'Shorebird', 'Other'])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [rescuerName, setRescuerName] = useState('')
  const [rescuerPhone, setRescuerPhone] = useState('')
  const router = useRouter()
  // const pageLocation = location

  // useEffect(() => {
  //   fetchBirdRescues()
  //   testAirtableConnection()
  // }, [])

  // const testAirtableConnection = async () => {
  //   try {
  //     const records = await base('Bird Alerts').select().firstPage()
  //     console.log('Airtable connection successful. First record:', records[0])
  //   } catch (error) {
  //     console.error('Airtable connection failed:', error)
  //   }
  // }

  // const fetchBirdRescues = async () => {
  //   setIsLoading(true)
  //   setError(null)
  //   try {
  //     const records = await base('Bird Alerts').select().all()
  //     const rescues: Bird[] = records.map(record => ({
  //       id: record.get('_id') as string,
  //       species: record.get('Type of Bird') as string,
  //       location: record.get('Full Pick Up Address') as string,
  //       destination: record.get('Drop Off Address') as string,
  //       status: record.get('VolunteerStatus') as RescueStatus,
  //       rescuerName: record.get('Current Volunteer') as string

  //     }))
  //     setBirdRescues(rescues)
  //   } catch (error) {
  //     console.error('Error fetching bird rescues:', error)
  //     setError('Failed to fetch bird rescues. Please try again later.')
  //   }
  //   setIsLoading(false)
  // }

  // const handleStatusChange = async (newStatus: RescueStatus) => {
  //   if (selectedRescue) {
  //     setIsLoading(true)
  //     try {
  //       const updatedFields = { VolunteerStatus: newStatus }
        
  //       if (newStatus === 'Pending') {
  //         setShowAcceptForm(true)
  //         setIsLoading(false)
  //         return
  //       }

  //       await updateRescueInAirtable(selectedRescue.id, updatedFields)

  //       const updatedBird = {
  //         ...selectedRescue,
  //         ...updatedFields,
  //       }
  //       setBirdRescues(birdRescues.map(bird => 
  //         bird.id === selectedRescue.id ? updatedBird : bird
  //       ))
  //       setSelectedRescue(updatedBird)

  //     } catch (error) {
  //       console.error('Error updating bird rescue status:', error)
  //       setError('Failed to update rescue status. Please try again.')
  //     }
  //     setIsLoading(false)
  //     fetchBirdRescues()
  //   }
    
  // }  

  

  
  // const updateRescueInAirtable = async (id: string, fields: any) => {
  //   // console.log('Updating Airtable record:', id, 'with fields:', fields)
  //   try {
  //     const updatedRecords = await base('Bird Alerts').update([
  //       {
  //         id,
  //         fields: fields
  //       }
  //     ])
  //     console.log('Airtable update response:', updatedRecords)
  //     return updatedRecords
  //   } catch (error) {
  //     console.error('Error updating Airtable:', error)
  //     throw error
  //   }
  // }

  // const handleAcceptSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (selectedRescue) {
  //     setIsLoading(true)
  //     try {
  //       console.log('Submitting form with data:', { rescuerName, rescuerPhone })
        
  //       const updatedFields: Partial<Bird> = {
  //         status: 'In Route',
  //         rescuerName,
  //       }

  //       console.log('Updating Airtable with fields:', updatedFields)

  //       await updateRescueInAirtable(selectedRescue.id, updatedFields)

  //       console.log('Airtable update successful')

  //       const updatedBird = {
  //         ...selectedRescue,
  //         ...updatedFields,
  //       }
  //       setBirdRescues(birdRescues.map(bird => 
  //         bird.id === selectedRescue.id ? updatedBird : bird
  //       ))
  //       setSelectedRescue(updatedBird)
  //       setShowAcceptForm(false)
  //       setRescuerName('')
  //       setRescuerPhone('')
  //     } catch (error) {
  //       console.error('Detailed error when accepting rescue:', error)
  //       setError('Failed to accept rescue. Please try again.')
  //     }
  //     setIsLoading(false)
  //   }
  // }

  // const getStatusColor = (status: RescueStatus) => {
  //   switch (status) {
  //     case 'Pending': return 'bg-lime-600'
  //     case 'In Route': return 'bg-red-700'
  //     case 'Rescued': return 'bg-emerald-700'
  //     case 'Delivered': return 'bg-teal-700'
  //   }
  // }

  // const AcceptForm = () => {
  //   const [localRescuerName, setLocalRescuerName] = useState(rescuerName)
  //   const [localRescuerPhone, setLocalRescuerPhone] = useState(rescuerPhone)
  //   const [formError, setFormError] = useState<string | null>(null)

  //   const handleSubmit = async (e: React.FormEvent) => {
  //     e.preventDefault()
  //     setFormError(null)
  //     try {
  //       await handleAcceptSubmit(e)
  //       setRescuerName(localRescuerName)
  //       setRescuerPhone(localRescuerPhone)
  //     } catch (error) {
  //       console.error('Error in form submission:', error)
  //       setFormError('Failed to submit form. Please try again.')
  //     }
  //   }

  //   return (
  //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAcceptForm(false)}>
  //       <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
  //         <CardHeader>
  //           <div className="flex justify-between items-center">
  //             <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Accept Rescue</CardTitle>
  //             <Button variant="ghost" size="icon" onClick={() => setShowAcceptForm(false)}>
  //               <XIcon className="h-4 w-4" />
  //             </Button>
  //           </div>
  //         </CardHeader>
  //         <CardContent>
  //           <form onSubmit={handleSubmit} className="space-y-4">
  //             <div className="space-y-2">
  //               <Label htmlFor="rescuerName">Your Name</Label>
  //               <Input
  //                 id="rescuerName"
  //                 value={localRescuerName}
  //                 onChange={(e) => setLocalRescuerName(e.target.value)}
  //                 required
  //               />
  //             </div>
  //             <div className="space-y-2">
  //               <Label htmlFor="rescuerPhone">Your Phone Number</Label>
  //               <Input
  //                 id="rescuerPhone"
  //                 value={localRescuerPhone}
  //                 onChange={(e) => setLocalRescuerPhone(e.target.value)}
  //                 required
  //               />
  //             </div>
  //             {formError && (
  //               <div className="text-red-500 text-sm">{formError}</div>
  //             )}
  //             <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700 text-white">
  //               Accept Rescue
  //             </Button>
  //           </form>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  // const ListView = () => (
  //   <div className="p-4 space-y-4">
  //     <Card className="mb-4 bg-gradient-to-r from-lime-700 to-lime-900 text-white">
  //       <CardHeader>
  //         <CardTitle className="text-xl md:text-2xl font-bold">Iowa Bird Rescue</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="flex items-center text-sm">
  //           <MapPinIcon className="mr-2 h-4 w-4" />
  //           <span>My Location: {location}</span>
  //         </div>
  //       </CardContent>
  //     </Card>

  //     {selectedRescue ? (
  //       <RescueDetails rescue={selectedRescue} onBack={() => setSelectedRescue(null)} />
  //     ) : (
  //       <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
  //         <CardHeader className="bg-stone-100 border-b border-stone-200">
  //           <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Available Rescues</CardTitle>
  //         </CardHeader>
  //         <CardContent className="p-4">
  //           {/* <FilterOptions /> */}
  //           {isLoading ? (
  //             <div className="flex justify-center items-center h-32">
  //               <div className="w-8 h-8 border-t-2 border-lime-500 rounded-full animate-spin" />
  //             </div>
  //           ) : error ? (
  //             <div className="flex justify-center items-center h-32 text-red-500">
  //               <p>{error}</p>
  //             </div>
  //           ) : (
  //             <div className="grid grid-cols-1 gap-4">
  //               {birdRescues.filter(bird => 
  //                 selectedStatuses.includes(bird.status)
  //               ).map(rescue => (
  //                 <Card key={rescue.id} className="overflow-hidden">
  //                   <CardHeader className="p-4">
  //                     <div className="flex justify-between items-center">
  //                       <div className="flex items-center space-x-2">
  //                         {/* <span className="text-2xl">{getBirdTypeIcon(rescue.birdType)}</span> */}
  //                         <CardTitle className="text-lg font-semibold">{rescue.species}</CardTitle>
  //                       </div>
  //                       <Badge variant="secondary" className={`${getStatusColor(rescue.status)} text-white h-10`}>
  //                         {rescue.status}
  //                       </Badge>
  //                     </div>
  //                   </CardHeader>
  //                   <CardContent className="p-4">
  //                     <div className="space-y-2">
  //                       <div className="flex items-center text-sm text-stone-600">
  //                         <MapPinIcon className="mr-2 h-4 w-4 flex-shrink-0" />
  //                         <span className="truncate">{rescue.location}</span>
  //                       </div>
  //                       <div className="flex items-center text-sm text-stone-600">
  //                         <HomeIcon className="mr-2 h-4 w-4 flex-shrink-0" />
  //                         <span className="truncate">{rescue.destination}</span>
  //                       </div>
  //                       <div className="flex items-center text-sm text-stone-600">
  //                         <TruckIcon className="mr-2 h-4 w-4 flex-shrink-0" />
  //                         {/* <span>{rescue.distance}</span> */}
  //                         <span>Current Volunteer: <span className='bold-text'>{rescue.rescuerName ? rescue.rescuerName : "AVAILABLE"}</span> </span>
  //                       </div>
  //                     </div>
  //                   </CardContent>
  //                   <CardFooter className="bg-stone-50 p-4">
  //                     <Button 
  //                       className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:text-accent-foreground h-9 px-4 py-2 w-full bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out text-black"
  //                       onClick={() => setSelectedRescue(rescue)}
  //                     >
  //                       View Details
  //                     </Button>
  //                   </CardFooter>
  //                 </Card>
  //               ))}
  //             </div>
  //           )}
  //         </CardContent>
  //       </Card>
  //     )}
  //   </div>
  // )

  // const RescueDetails = ({ rescue, onBack }: { rescue: Bird, onBack: () => void }) => (
  //   <Card className="border shadow-lg rounded-lg overflow-hidden">
  //     <CardHeader className="bg-stone-100 border-b border-stone-200 px-4 py-2">
  //       <div className="flex items-center">
  //         <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
  //           <ArrowLeftIcon className="h-4 w-4" />
  //         </Button>
  //         <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Rescue Details</CardTitle>
  //       </div>
  //       <div className="flex items-center justify-between mt-2">
  //         <div className="flex items-center">
  //           {/* <span className="mr-2 text-2xl">{getBirdTypeIcon(rescue.birdType)}</span> */}
  //           <span className="font-medium text-stone-700">{rescue.species}</span>
  //         </div>
  //         <Badge variant="secondary" className={`${getStatusColor(rescue.status)} text-white`}>
  //           {rescue.status}
  //         </Badge>
  //       </div>
  //     </CardHeader>
  //     <CardContent className="px-4 py-4 space-y-4">
  //       {/* <img 
  //         src={rescue.image} 
  //         alt={rescue.species} 
  //         className="w-full h-48 object-cover rounded-md shadow-md"
  //       /> */}
  //       <div className="space-y-4">
  //         <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
  //           <div className="flex items-center overflow-hidden">
  //             <MapPinIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
  //             <span className="text-stone-700 truncate">{rescue.location}</span>
  //           </div>
  //           <Button 
  //             variant="link" 
  //             size="sm" 
  //             className="text-lime-600 hover:text-lime-700 transition-colors duration-200 whitespace-nowrap"
  //             onClick={() => console.log(`Getting directions to: ${rescue.location}`)}
  //           >
  //             <NavigationIcon className="mr-1 h-4 w-4" />
  //             Directions
  //           </Button>
  //         </div>
  //         <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
  //           <div className="flex items-center overflow-hidden">
  //             <HomeIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
  //             <span className="text-stone-700 truncate">{rescue.destination}</span>
  //           </div>
  //           <Button 
  //             variant="link" 
  //             size="sm" 
  //             className="text-lime-600 hover:text-lime-700 transition-colors duration-200 whitespace-nowrap"
  //             onClick={() => console.log(`Getting directions to: ${rescue.destination}`)}
  //           >
  //             <NavigationIcon className="mr-1 h-4 w-4" />
  //             Directions
  //           </Button>
  //         </div>
  //         <div className="flex items-center bg-stone-50 p-3 rounded-md">
  //           <TruckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
  //           <span>Current Volunteer: <span className='bold-text'>{rescue.rescuerName ? rescue.rescuerName : "AVAILABLE"}</span> </span>

  //           {/* <span className="text-stone-700">{rescue.distance}</span> */}
  //         </div>
  //       </div>
  //       <div className="space-y-4">
  //         {/* <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="outline" className="w-full bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out">
  //               <MoreHorizontalIcon className="mr-2 h-4 w-4" />
  //               Change Status
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent className="w-56">
  //             {(['Pending', 'In Route', 'Pending', 'Rescued'] as RescueStatus[]).map((status) => (
  //               <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
  //                 {status}
  //               </DropdownMenuItem>
  //             ))}
  //           </DropdownMenuContent>
  //         </DropdownMenu> */}
  //         {rescue.status === 'Pending' && (
  //           <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white transition-colors duration-200" onClick={() => handleStatusChange('In Route')}>
  //             Accept Rescue
  //           </Button>
  //         )}
  //         {rescue.status === 'In Route' && (
  //           <Button className="w-full bg-red-700 hover:bg-red-800 text-white transition-colors duration-200" onClick={() => handleStatusChange('Rescued')}>
  //             Mark as rescued
  //           </Button>
  //         )}
  //         {rescue.status === 'Rescued' && (
  //           <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white transition-colors duration-200" onClick={() => handleStatusChange('Delivered')}>
  //             Mark as Delivered
  //           </Button>
  //         )}
  //       </div>
  //     </CardContent>
  //   </Card>
  // )


  return (
    <div className="flex flex-col min-h-screen bg-stone-100">
      <div className="flex-grow overflow-y-auto pb-16">
        {/* {activeView === 'list' && <ListView />} */}
        <BirdAlertList ></BirdAlertList>
      </div>
      {/* <Link href={"/test"}> Link</Link> */}
      {/* {showAcceptForm && <AcceptForm />} */}
      {/* <Router>
        <Route ref="/" ></Route>
      </Router> */}
      
    </div>
  )
}
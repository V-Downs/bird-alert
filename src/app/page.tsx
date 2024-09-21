'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon, BirdIcon, TruckIcon, HomeIcon, CheckCircleIcon, MoreHorizontalIcon, UserIcon, ListIcon, MapIcon, ArrowLeftIcon, NavigationIcon, ChevronUpIcon, ChevronDownIcon, ShieldIcon, FilterIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Airtable from 'airtable'

type RescueStatus = 'Available' | 'Accepted' | 'En Route' | 'Delivered - Rehabilitating' | 'Delivered - Released'
type BirdType = 'Songbird' | 'Raptor' | 'Waterfowl' | 'Shorebird' | 'Other'

interface Bird {
  id: string
  species: string
  birdType: BirdType
  location: string
  destination: string
  distance: string
  status: RescueStatus
  image: string
  rescuerName?: string
  rescuerPhone?: string
}

const getBirdTypeIcon = (birdType: BirdType) => {
  switch (birdType) {
    case 'Songbird': return '🐦'
    case 'Raptor': return '🦅'
    case 'Waterfowl': return '🦆'
    case 'Shorebird': return '🐧'
    case 'Other': return '🐤'
  }
}

// Initialize Airtable
const airtable = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN })
const base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

export default function BirdRescueApp() {
  const [location, setLocation] = useState<string>('Des Moines, IA')
  const [birdRescues, setBirdRescues] = useState<Bird[]>([])
  const [selectedRescue, setSelectedRescue] = useState<Bird | null>(null)
  const [activeView, setActiveView] = useState<'list' | 'admin'>('list')
  const [selectedStatuses, setSelectedStatuses] = useState<RescueStatus[]>(['Available', 'Accepted', 'En Route'])
  const [selectedBirdTypes, setSelectedBirdTypes] = useState<BirdType[]>(['Songbird', 'Raptor', 'Waterfowl', 'Shorebird', 'Other'])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAcceptForm, setShowAcceptForm] = useState(false)
  const [rescuerName, setRescuerName] = useState('')
  const [rescuerPhone, setRescuerPhone] = useState('')

  useEffect(() => {
    fetchBirdRescues()
  }, [])

  const fetchBirdRescues = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const records = await base('Bird Rescues').select().all()
      const rescues: Bird[] = records.map(record => ({
        id: record.id,
        species: record.get('species') as string,
        birdType: record.get('birdType') as BirdType,
        location: record.get('location') as string,
        destination: record.get('destination') as string,
        distance: record.get('distance') as string,
        status: record.get('status') as RescueStatus,
        image: record.get('image') as string,
        rescuerName: record.get('rescuerName') as string,
        rescuerPhone: record.get('rescuerPhone') as string,
      }))
      setBirdRescues(rescues)
    } catch (error) {
      console.error('Error fetching bird rescues:', error)
      setError('Failed to fetch bird rescues. Please try again later.')
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (newStatus: RescueStatus) => {
    if (selectedRescue) {
      setIsLoading(true)
      try {
        const updatedFields: Partial<Bird> = { status: newStatus }
        
        if (newStatus === 'Accepted') {
          setShowAcceptForm(true)
          setIsLoading(false)
          return
        }

        await updateRescueInAirtable(selectedRescue.id, updatedFields)

        const updatedBird = {
          ...selectedRescue,
          ...updatedFields,
        }
        setBirdRescues(birdRescues.map(bird => 
          bird.id === selectedRescue.id ? updatedBird : bird
        ))
        setSelectedRescue(updatedBird)

      } catch (error) {
        console.error('Error updating bird rescue status:', error)
        setError('Failed to update rescue status. Please try again.')
      }
      setIsLoading(false)
    }
  }

  const updateRescueInAirtable = async (id: string, fields: Partial<Bird>) => {
    await base('Bird Rescues').update([
      {
        id,
        fields: fields as any,
      }
    ])
  }

  const handleAcceptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRescue) {
      setIsLoading(true)
      try {
        const updatedFields: Partial<Bird> = {
          status: 'Accepted',
          rescuerName,
          rescuerPhone,
        }

        await updateRescueInAirtable(selectedRescue.id, updatedFields)

        const updatedBird = {
          ...selectedRescue,
          ...updatedFields,
        }
        setBirdRescues(birdRescues.map(bird => 
          bird.id === selectedRescue.id ? updatedBird : bird
        ))
        setSelectedRescue(updatedBird)
        setShowAcceptForm(false)
        setRescuerName('')
        setRescuerPhone('')
      } catch (error) {
        console.error('Error accepting rescue:', error)
        setError('Failed to accept rescue. Please try again.')
      }
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: RescueStatus) => {
    switch (status) {
      case 'Available': return 'bg-lime-600'
      case 'Accepted': return 'bg-orange-600'
      case 'En Route': return 'bg-red-700'
      case 'Delivered - Rehabilitating': return 'bg-emerald-700'
      case 'Delivered - Released': return 'bg-teal-700'
    }
  }

  const AcceptForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Accept Rescue</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAcceptForm(false)}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rescuerName">Your Name</Label>
              <Input
                id="rescuerName"
                value={rescuerName}
                onChange={(e) => setRescuerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rescuerPhone">Your Phone Number</Label>
              <Input
                id="rescuerPhone"
                value={rescuerPhone}
                onChange={(e) => setRescuerPhone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700 text-white">
              Accept Rescue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  const ListView = () => (
    <div className="p-4 space-y-4">
      <Card className="mb-4 bg-gradient-to-r from-lime-700 to-lime-900 text-white">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold">Iowa Bird Rescue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm">
            <MapPinIcon className="mr-2 h-4 w-4" />
            <span>My Location: {location}</span>
          </div>
        </CardContent>
      </Card>

      {selectedRescue ? (
        <RescueDetails rescue={selectedRescue} onBack={() => setSelectedRescue(null)} />
      ) : (
        <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-stone-100 border-b border-stone-200">
            <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Available Rescues</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <FilterOptions />
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-8 h-8 border-t-2 border-lime-500 rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-32 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {birdRescues.filter(bird => 
                  selectedStatuses.includes(bird.status) &&
                  selectedBirdTypes.includes(bird.birdType)
                ).map(rescue => (
                  <Card key={rescue.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getBirdTypeIcon(rescue.birdType)}</span>
                          <CardTitle className="text-lg font-semibold">{rescue.species}</CardTitle>
                        </div>
                        <Badge variant="secondary" className={`${getStatusColor(rescue.status)} text-white`}>
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
                          <TruckIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span>{rescue.distance}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-stone-50 p-4">
                      <Button 
                        className="w-full bg-lime-600 hover:bg-lime-700 text-white"
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
  )

  const FilterOptions = () => (
    <div className="space-y-4 mb-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter by Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {(['Available', 'Accepted', 'En Route', 'Delivered - Rehabilitating', 'Delivered - Released'] as RescueStatus[]).map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={selectedStatuses.includes(status)}
                onCheckedChange={(checked) =>
                  setSelectedStatuses(prev =>
                    checked ? [...prev, status] : prev.filter(s => s !== status)
                  )
                }
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter by Bird Type
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {(['Songbird', 'Raptor', 'Waterfowl', 'Shorebird', 'Other'] as BirdType[]).map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={selectedBirdTypes.includes(type)}
                onCheckedChange={(checked) =>
                  setSelectedBirdTypes(prev =>
                    checked ? [...prev, type] : prev.filter(t => t !== type)
                  )
                }
              >
                {type}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const RescueDetails = ({ rescue, onBack }: { rescue: Bird, onBack: () => void }) => (
    <Card className="border shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-stone-100 border-b border-stone-200 px-4 py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg md:text-xl font-semibold text-stone-800">Rescue Details</CardTitle>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <span className="mr-2 text-2xl">{getBirdTypeIcon(rescue.birdType)}</span>
            <span className="font-medium text-stone-700">{rescue.species}</span>
          </div>
          <Badge variant="secondary" className={`${getStatusColor(rescue.status)} text-white`}>
            {rescue.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-4 space-y-4">
        <img 
          src={rescue.image} 
          alt={rescue.species} 
          className="w-full h-48 object-cover rounded-md shadow-md"
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
            <div className="flex items-center overflow-hidden">
              <MapPinIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
              <span className="text-stone-700 truncate">{rescue.location}</span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="text-lime-600 hover:text-lime-700 transition-colors duration-200 whitespace-nowrap"
              onClick={() => console.log(`Getting directions to: ${rescue.location}`)}
            >
              <NavigationIcon className="mr-1 h-4 w-4" />
              Directions
            </Button>
          </div>
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-md">
            <div className="flex items-center overflow-hidden">
              <HomeIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
              <span className="text-stone-700 truncate">{rescue.destination}</span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="text-lime-600 hover:text-lime-700 transition-colors duration-200 whitespace-nowrap"
              onClick={() => console.log(`Getting directions to: ${rescue.destination}`)}
            >
              <NavigationIcon className="mr-1 h-4 w-4" />
              Directions
            </Button>
          </div>
          <div className="flex items-center bg-stone-50 p-3 rounded-md">
            <TruckIcon className="mr-2 h-5 w-5 flex-shrink-0 text-stone-500" />
            <span className="text-stone-700">{rescue.distance}</span>
          </div>
        </div>
        <div className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full bg-white hover:bg-stone-50 transition-colors duration-200 ease-in-out">
                <MoreHorizontalIcon className="mr-2 h-4 w-4" />
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {(['Available', 'Accepted', 'En Route', 'Delivered - Rehabilitating', 'Delivered - Released'] as RescueStatus[]).map((status) => (
                <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {rescue.status === 'Available' && (
            <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white transition-colors duration-200" onClick={() => handleStatusChange('Accepted')}>
              Accept Rescue
            </Button>
          )}
          {rescue.status === 'Accepted' && (
            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200" onClick={() => handleStatusChange('En Route')}>
              Start Delivery
            </Button>
          )}
          {rescue.status === 'En Route' && (
            <Button className="w-full bg-red-700 hover:bg-red-800 text-white transition-colors duration-200" onClick={() => handleStatusChange('Delivered - Rehabilitating')}>
              Mark as Delivered
            </Button>
          )}
          {rescue.status === 'Delivered - Rehabilitating' && (
            <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white transition-colors duration-200" onClick={() => handleStatusChange('Delivered - Released')}>
              Mark as Released
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const AdminView = () => {
    const [newRescue, setNewRescue] = useState({
      species: '',
      birdType: 'Songbird' as BirdType,
      location: '',
      destination: '',
      image: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setNewRescue(prev => ({ ...prev, [name]: value }))
    }

    const handleBirdTypeChange = (value: string) => {
      setNewRescue(prev => ({ ...prev, birdType: value as BirdType }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setSubmitError(null)

      try {
        const newBird: Partial<Bird> = {
          species: newRescue.species,
          birdType: newRescue.birdType,
          location: newRescue.location,
          destination: newRescue.destination,
          distance: '0 miles', // This should be calculated based on actual coordinates
          status: 'Available',
          image: newRescue.image || '/placeholder.svg?height=200&width=200',
        }
        
        const createdRecord = await base('Bird Rescues').create([
          { fields: newBird as any }
        ])

        if (createdRecord && createdRecord[0]) {
          const createdBird: Bird = {
            ...newBird,
            id: createdRecord[0].id,
          } as Bird
          setBirdRescues([...birdRescues, createdBird])
          console.log(`New rescue created for ${newRescue.species}`)

          // Reset form
          setNewRescue({
            species: '',
            birdType: 'Songbird',
            location: '',
            destination: '',
            image: '',
          })
        }
      } catch (error) {
        console.error('Error creating new rescue:', error)
        setSubmitError('Failed to create new rescue. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }

    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold text-stone-800">Create New Rescue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="species">Bird Species</Label>
                <Input
                  id="species"
                  name="species"
                  value={newRescue.species}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birdType">Bird Type</Label>
                <Select onValueChange={handleBirdTypeChange} value={newRescue.birdType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bird type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Songbird">Songbird</SelectItem>
                    <SelectItem value="Raptor">Raptor</SelectItem>
                    <SelectItem value="Waterfowl">Waterfowl</SelectItem>
                    <SelectItem value="Shorebird">Shorebird</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Pick-up Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={newRescue.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Drop-off Location</Label>
                <Input
                  id="destination"
                  name="destination"
                  value={newRescue.destination}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Bird Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  value={newRescue.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/bird-image.jpg"
                />
              </div>
              {submitError && (
                <div className="text-red-500 text-sm">{submitError}</div>
              )}
              <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Rescue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-stone-100">
      <div className="flex-grow overflow-y-auto pb-16">
        {activeView === 'list' && <ListView />}
        {activeView === 'admin' && <AdminView />}
      </div>
      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 bg-white border-t shadow-lg">
        <Button variant="ghost" onClick={() => setActiveView('list')} className="text-stone-600 hover:text-stone-900 transition-colors duration-200">
          <ListIcon className="h-6 w-6" />
        </Button>
        <Button variant="ghost" onClick={() => setActiveView('admin')} className="text-stone-600 hover:text-stone-900 transition-colors duration-200">
          <ShieldIcon className="h-6 w-6" />
        </Button>
      </div>
      {showAcceptForm && <AcceptForm />}
    </div>
  )
}
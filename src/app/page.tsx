'use client'

import { useState, useEffect } from 'react'
import { MapPinIcon, BirdIcon, TruckIcon, HomeIcon, CheckCircleIcon, MoreHorizontalIcon, UserIcon, ListIcon, MapIcon, ArrowLeftIcon, NavigationIcon, ChevronUpIcon, ChevronDownIcon, ShieldIcon, FilterIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  id: number
  species: string
  birdType: BirdType
  location: string
  destination: string
  distance: string
  status: RescueStatus
  image: string
}

interface Volunteer {
  id: number
  name: string
  avatar: string
  rescuesCompleted: number
}

const currentVolunteer: Volunteer = {
  id: 1,
  name: 'Jane Doe',
  avatar: '/placeholder.svg?height=40&width=40',
  rescuesCompleted: 15
}

const getBirdTypeIcon = (birdType: BirdType) => {
  switch (birdType) {
    case 'Songbird':
      return '🐦'
    case 'Raptor':
      return '🦅'
    case 'Waterfowl':
      return '🦆'
    case 'Shorebird':
      return '🐧'
    case 'Other':
      return '🐤'
  }
}

function FakeMap({ birds, onSelectBird }: { birds: Bird[], onSelectBird: (bird: Bird) => void }) {
  const getIconForStatus = (status: RescueStatus) => {
    switch (status) {
      case 'Available':
        return <MapPinIcon className="h-5 w-5 text-red-500" />
      case 'Accepted':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />
      case 'En Route':
        return <TruckIcon className="h-5 w-5 text-yellow-500" />
      case 'Delivered - Rehabilitating':
      case 'Delivered - Released':
        return <HomeIcon className="h-5 w-5 text-green-500" />
    }
  }

  return (
    <div className="relative w-full h-full bg-green-100 border border-green-300 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-green-700 text-lg font-semibold">
        Fake Map of Iowa
      </div>
      {birds.map((bird) => (
        <Button
          key={bird.id}
          variant="outline"
          size="icon"
          className="absolute p-0 w-8 h-8"
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
          }}
          onClick={() => onSelectBird(bird)}
        >
          {getIconForStatus(bird.status)}
        </Button>
      ))}
    </div>
  )
}

// Initialize Airtable
const airtable = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_ACCESS_TOKEN })
const base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID!)

export default function BirdRescueApp() {
  const [location, setLocation] = useState<string>('Des Moines, IA')
  const [birdRescues, setBirdRescues] = useState<Bird[]>([])
  const [selectedRescue, setSelectedRescue] = useState<Bird | null>(null)
  const [activeView, setActiveView] = useState<'list' | 'map' | 'profile' | 'admin'>('list')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<RescueStatus[]>(['Available', 'Accepted', 'En Route'])
  const [selectedBirdTypes, setSelectedBirdTypes] = useState<BirdType[]>(['Songbird', 'Raptor', 'Waterfowl', 'Shorebird', 'Other'])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBirdRescues()
  }, [])

  const fetchBirdRescues = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching bird rescues...')
      const records = await base('Bird Rescues').select().all()
      console.log('Fetched records:', records)
      const rescues: Bird[] = records.map(record => ({
        id: record.get('id') as number,
        species: record.get('species') as string,
        birdType: record.get('birdType') as BirdType,
        location: record.get('location') as string,
        destination: record.get('destination') as string,
        distance: record.get('distance') as string,
        status: record.get('status') as RescueStatus,
        image: record.get('image') as string,
      }))
      console.log('Parsed rescues:', rescues)
      setBirdRescues(rescues)
    } catch (error) {
      console.error('Error fetching bird rescues:', error)
      setError('Failed to fetch bird rescues. Please try again later.')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (selectedRescue) {
      setDrawerOpen(true)
    }
  }, [selectedRescue])

  const handleStatusChange = async (newStatus: RescueStatus) => {
    if (selectedRescue) {
      const updatedBird = {
        ...selectedRescue,
        status: newStatus,
      }
      try {
        await base('Bird Rescues').update([
          {
            id: selectedRescue.id.toString(),
            fields: {
              status: newStatus,
            }
          }
        ])
        setBirdRescues(birdRescues.map(bird => 
          bird.id === selectedRescue.id ? updatedBird : bird
        ))
        setSelectedRescue(updatedBird)
      } catch (error) {
        console.error('Error updating bird rescue status:', error)
      }
    }
  }

  const handleSelectBird = (bird: Bird) => {
    setSelectedRescue(bird)
    setDrawerOpen(true)
  }

  const getStatusColor = (status: RescueStatus) => {
    switch (status) {
      case 'Available':
        return 'text-red-500'
      case 'Accepted':
        return 'text-blue-500'
      case 'En Route':
        return 'text-yellow-500'
      case 'Delivered - Rehabilitating':
      case 'Delivered - Released':
        return 'text-green-500'
    }
  }

  const getIconForStatus = (status: RescueStatus) => {
    switch (status) {
      case 'Available':
        return <MapPinIcon className="h-5 w-5" />
      case 'Accepted':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'En Route':
        return <TruckIcon className="h-5 w-5" />
      case 'Delivered - Rehabilitating':
      case 'Delivered - Released':
        return <HomeIcon className="h-5 w-5" />
    }
  }

  const getMainActionButton = (status: RescueStatus) => {
    switch (status) {
      case 'Available':
        return (
          <Button className="w-full" onClick={() => handleStatusChange('Accepted')}>
            Accept Rescue
          </Button>
        )
      case 'Accepted':
        return (
          <Button className="w-full" onClick={() => handleStatusChange('En Route')}>
            Start Delivery
          </Button>
        )
      case 'En Route':
        return (
          <Button className="w-full" onClick={() => handleStatusChange('Delivered - Rehabilitating')}>
            Mark as Delivered
          </Button>
        )
      case 'Delivered - Rehabilitating':
        return (
          <Button className="w-full" onClick={() => handleStatusChange('Delivered - Released')}>
            Mark as Released
          </Button>
        )
      default:
        return null
    }
  }

  const handleGetDirections = (address: string) => {
    console.log(`Getting directions to: ${address}`)
  }

  const RescueDetails = ({ rescue, onBack }: { rescue: Bird, onBack: () => void }) => (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-col space-y-1.5 px-4 py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl font-semibold">Rescue Details</CardTitle>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <span className="mr-2 text-2xl">{getBirdTypeIcon(rescue.birdType)}</span>
            <span className="font-medium">{rescue.species}</span>
          </div>
          <Badge variant="secondary" className={getStatusColor(rescue.status)}>
            {rescue.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 space-y-4">
        <img src={rescue.image} alt={rescue.species} className="w-full h-48 object-cover rounded-md" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPinIcon className="mr-2 h-5 w-5 text-gray-500" />
              <span>{rescue.location}</span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-blue-500 hover:text-blue-700"
              onClick={() => handleGetDirections(rescue.location)}
            >
              <NavigationIcon className="mr-1 h-4 w-4" />
              Directions
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HomeIcon className="mr-2 h-5 w-5 text-gray-500" />
              <span>{rescue.destination}</span>
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-blue-500 hover:text-blue-700"
              onClick={() => handleGetDirections(rescue.destination)}
            >
              <NavigationIcon className="mr-1 h-4 w-4" />
              Directions
            </Button>
          </div>
          <div className="flex items-center">
            <TruckIcon className="mr-2 h-5 w-5 text-gray-500" />
            <span>{rescue.distance}</span>
          </div>
        </div>
        <div className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                <MoreHorizontalIcon className="mr-2 h-4 w-4" />
                Change Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onSelect={() => handleStatusChange('Available')}>
                Available
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatusChange('Accepted')}>
                Accepted
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatusChange('En Route')}>
                En Route
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatusChange('Delivered - Rehabilitating')}>
                Delivered - Rehabilitating
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleStatusChange('Delivered - Released')}>
                Delivered - Released
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {getMainActionButton(rescue.status)}
        </div>
      </CardContent>
    </Card>
  )

  const filteredBirdRescues = birdRescues.filter(bird => 
    selectedStatuses.includes(bird.status) &&
    selectedBirdTypes.includes(bird.birdType)
  )

  const FilterOptions = () => (
    <div className="space-y-4 mb-4">
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter by Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('Available')}
              onCheckedChange={(checked) =>
                setSelectedStatuses(prev =>
                  checked ? [...prev, 'Available'] : prev.filter(s => s !== 'Available')
                )
              }
            >
              Available
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('Accepted')}
              onCheckedChange={(checked) =>
                setSelectedStatuses(prev =>
                  checked ? [...prev, 'Accepted'] : prev.filter(s => s !== 'Accepted')
                )
              }
            >
              Accepted
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('En Route')}
              onCheckedChange={(checked) =>
                setSelectedStatuses(prev =>
                  checked ? [...prev, 'En Route'] : prev.filter(s => s !== 'En Route')
                )
              }
            >
              En Route
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('Delivered - Rehabilitating')}
              onCheckedChange={(checked) =>
                setSelectedStatuses(prev =>
                  checked ? [...prev, 'Delivered - Rehabilitating'] : prev.filter(s => s !== 'Delivered - Rehabilitating')
                )
              }
            >
              Delivered - Rehabilitating
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes('Delivered - Released')}
              onCheckedChange={(checked) =>
                setSelectedStatuses(prev =>
                  checked ? [...prev, 'Delivered - Released'] : prev.filter(s => s !== 'Delivered - Released')
                )
              }
            >
              Delivered - Released
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter by Bird Type
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuCheckboxItem
              checked={selectedBirdTypes.includes('Songbird')}
              onCheckedChange={(checked) =>
                setSelectedBirdTypes(prev =>
                  checked ? [...prev, 'Songbird'] : prev.filter(t => t !== 'Songbird')
                )
              }
            >
              Songbird
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedBirdTypes.includes('Raptor')}
              onCheckedChange={(checked) =>
                setSelectedBirdTypes(prev =>
                  checked ? [...prev, 'Raptor'] : prev.filter(t => t !== 'Raptor')
                )
              }
            >
              Raptor
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedBirdTypes.includes('Waterfowl')}
              onCheckedChange={(checked) =>
                setSelectedBirdTypes(prev =>
                  checked ? [...prev, 'Waterfowl'] : prev.filter(t => t !== 'Waterfowl')
                )
              }
            >
              Waterfowl
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedBirdTypes.includes('Shorebird')}
              onCheckedChange={(checked) =>
                setSelectedBirdTypes(prev =>
                  checked ? [...prev, 'Shorebird'] : prev.filter(t => t !== 'Shorebird')
                )
              }
            >
              Shorebird
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedBirdTypes.includes('Other')}
              onCheckedChange={(checked) =>
                setSelectedBirdTypes(prev =>
                  checked ? [...prev, 'Other'] : prev.filter(t => t !== 'Other')
                )
              }
            >
              Other
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  const ListView = () => (
    <div className="p-4 space-y-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Iowa Bird Rescue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPinIcon className="mr-2 h-4 w-4" />
            <span>My Location: {location}</span>
          </div>
        </CardContent>
      </Card>

      {selectedRescue ? (
        <RescueDetails rescue={selectedRescue} onBack={() => setSelectedRescue(null)} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Available Rescues</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterOptions />
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <p>Loading rescues...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-32 text-red-500">
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBirdRescues.map(rescue => (
                  <Button
                    key={rescue.id}
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setSelectedRescue(rescue)}
                  >
                    <span className="mr-2 text-2xl">{getBirdTypeIcon(rescue.birdType)}</span>
                    <span className="flex-grow text-left">{rescue.species} - {rescue.location}</span>
                    <Badge variant="secondary" className={getStatusColor(rescue.status)}>
                      {rescue.status}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )

  const MapView = () => (
    <div className="relative h-[calc(100vh-5rem)]">
      <div className="absolute top-4 right-4 z-10 bg-white p-4 rounded-md shadow-md w-64">
        <FilterOptions />
      </div>
      <FakeMap birds={filteredBirdRescues} onSelectBird={handleSelectBird} />
      {drawerOpen && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white transition-transform duration-300 ease-in-out transform ${
            drawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ height: 'calc(50% + 2.5rem)' }}
        >
          <div 
            className="flex justify-center items-center h-10 bg-gray-100 cursor-pointer"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <ChevronDownIcon className="h-6 w-6" />
          </div>
          <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
            {selectedRescue ? (
              <RescueDetails rescue={selectedRescue} onBack={() => {
                setSelectedRescue(null)
                setDrawerOpen(false)
              }} />
            ) : (
              <Card className="border-none shadow-none rounded-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Available Rescues</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredBirdRescues.map(rescue => (
                    <Button
                      key={rescue.id}
                      className="w-full mb-2 justify-start"
                      variant="outline"
                      onClick={() => setSelectedRescue(rescue)}
                    >
                      <span className="mr-2 text-2xl">{getBirdTypeIcon(rescue.birdType)}</span>
                      <span className="flex-grow text-left">{rescue.species} - {rescue.location}</span>
                      <Badge variant="secondary" className={getStatusColor(rescue.status)}>
                        {rescue.status}
                      </Badge>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const ProfileView = () => (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Volunteer Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={currentVolunteer.avatar} alt={currentVolunteer.name} />
              <AvatarFallback>{currentVolunteer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{currentVolunteer.name}</h2>
              <p className="text-muted-foreground">Rescues Completed: {currentVolunteer.rescuesCompleted}</p>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">My Rescues</h3>
          {birdRescues.filter(rescue => rescue.status !== 'Available').map(rescue => (
            <div key={rescue.id} className="mb-2 p-2 border rounded">
              <div className="flex justify-between items-center">
                <span>{getBirdTypeIcon(rescue.birdType)} {rescue.species}</span>
                <Badge variant="secondary" className={getStatusColor(rescue.status)}>
                  {rescue.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{rescue.location}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const AdminView = () => {
    const [newRescue, setNewRescue] = useState({
      species: '',
      birdType: 'Songbird' as BirdType,
      location: '',
      destination: '',
      image: null as File | null,
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setNewRescue(prev => ({ ...prev, [name]: value }))
    }

    const handleBirdTypeChange = (value: string) => {
      setNewRescue(prev => ({ ...prev, birdType: value as BirdType }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setNewRescue(prev => ({ ...prev, image: e.target.files![0] }))
      }
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        const newBird: Partial<Bird> = {
          species: newRescue.species,
          birdType: newRescue.birdType,
          location: newRescue.location,
          destination: newRescue.destination,
          distance: '0 miles', // This should be calculated based on actual coordinates
          status: 'Available',
          image: newRescue.image ? URL.createObjectURL(newRescue.image) : '/placeholder.svg?height=200&width=200',
        }
        
        const createdRecord = await base('Bird Rescues').create([
          { fields: newBird as any }
        ])

        if (createdRecord && createdRecord[0]) {
          const createdBird: Bird = {
            ...newBird,
            id: parseInt(createdRecord[0].getId()),
          } as Bird
          setBirdRescues([...birdRescues, createdBird])
          console.log(`New rescue created for ${newRescue.species}`)
        }

        // Reset form
        setNewRescue({
          species: '',
          birdType: 'Songbird',
          location: '',
          destination: '',
          image: null,
        })
      } catch (error) {
        console.error('Error creating new rescue:', error)
      }
    }

    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create New Rescue</CardTitle>
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
                <Label htmlFor="image">Bird Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Rescue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-y-auto">
        {activeView === 'list' && <ListView />}
        {activeView === 'map' && <MapView />}
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'admin' && <AdminView />}
      </div>
      <div className="flex justify-around items-center h-16 bg-white border-t">
        <Button variant="ghost" onClick={() => setActiveView('list')}>
          <ListIcon className="h-6 w-6" />
        </Button>
        <Button variant="ghost" onClick={() => setActiveView('map')}>
          <MapIcon className="h-6 w-6" />
        </Button>
        <Button variant="ghost" onClick={() => setActiveView('profile')}>
          <UserIcon className="h-6 w-6" />
        </Button>
        <Button variant="ghost" onClick={() => setActiveView('admin')}>
          <ShieldIcon className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
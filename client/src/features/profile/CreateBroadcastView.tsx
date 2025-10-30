
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Mic } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

export const CreateBroadcastView = () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    return (
        <div className="grid grid-cols-2 gap-8 h-full">
            {/* Left Side: Create Broadcast / First Episode */}
            <div className="border-r pr-8 space-y-4 overflow-y-auto">
                <h4 className="font-bold text-lg">Want to Broadcast something?</h4>
                
                <div>
                    <Label htmlFor="broadcast-name">Broadcast Name</Label>
                    <Input id="broadcast-name" placeholder="e.g., Union Weekly News" />
                </div>

                <div>
                    <Label htmlFor="episode-name">Episode Name</Label>
                    <Input id="episode-name" placeholder="e.g., Episode 1: The Beginning" />
                </div>

                <div>
                    <Label>Upload Media</Label>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1"><Upload className="mr-2 h-4 w-4" /> MP3/MP4</Button>
                        <Button variant="outline" className="flex-1"><Mic className="mr-2 h-4 w-4" /> Record</Button>
                    </div>
                </div>

                <div>
                    <Label htmlFor="episode-description">Description</Label>
                    <Textarea id="episode-description" placeholder="What is this episode about?" />
                </div>

                <div>
                    <Label htmlFor="cover-image">Cover Image URL</Label>
                    <Input id="cover-image" placeholder="https://example.com/cover.png" />
                </div>

                <div>
                    <Label>Extra Images (up to 9)</Label>
                    <Input type="file" multiple accept="image/*" />
                </div>

                <div>
                    <Label>Broadcast Date & Time</Label>
                    <div className="flex gap-2">
                        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                        <Input type="time" className="w-full" />
                    </div>
                </div>

                <div>
                    <Label htmlFor="tags">Tags (up to 10, comma-separated)</Label>
                    <Input id="tags" placeholder="news, community, events" />
                </div>

                <div>
                    <Label htmlFor="website">Optional Website</Label>
                    <Input id="website" placeholder="https://example.com" />
                </div>

                <Button>Submit</Button>
            </div>

            {/* Right Side: Add Another Episode (conditionally rendered) */}
            <div className="flex flex-col space-y-4 text-muted-foreground">
                <h4 className="font-bold text-lg text-foreground">Want to Add Another Episode?</h4>
                <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-md p-8 text-center">
                    <p>Select one of your created broadcasts to add a new episode. (You can create up to 10 broadcasts, with 10 episodes each.)</p>
                </div>
            </div>
        </div>
    );
};

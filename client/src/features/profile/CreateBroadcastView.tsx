
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const CreateBroadcastView = () => (
    <div className="grid grid-cols-2 gap-8 h-full">
        {/* Left Side: Create Broadcast */}
        <div className="border-r pr-8">
            <h4 className="font-bold text-lg mb-4">Want to Broadcast something?</h4>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="broadcast-name">Broadcast Name</Label>
                    <Input id="broadcast-name" placeholder="e.g., Union Weekly News" />
                </div>
                <div>
                    <Label htmlFor="broadcast-logo">Broadcast Logo URL</Label>
                    <Input id="broadcast-logo" placeholder="https://example.com/logo.png" />
                </div>
                <Button>Create Broadcast</Button>
            </div>
        </div>

        {/* Right Side: Add Episode */}
        <div className="flex flex-col space-y-4">
            <h4 className="font-bold text-lg">Want to Add Another Episode?</h4>
            <p className="text-muted-foreground text-sm">Select a broadcast you own to add an episode.</p>
            <div>
                <Label htmlFor="episode-name">Episode Name</Label>
                <Input id="episode-name" placeholder="e.g., Episode 5: Community Spotlight" />
            </div>
            <div>
                <Label htmlFor="episode-description">Episode Description</Label>
                <Textarea id="episode-description" placeholder="What is this episode about?" />
            </div>
            <Button>Add Episode</Button>
        </div>
    </div>
);

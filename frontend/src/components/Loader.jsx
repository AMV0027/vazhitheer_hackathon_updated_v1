import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

function Loader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-yellow-800 font-medium">Loading...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default Loader;

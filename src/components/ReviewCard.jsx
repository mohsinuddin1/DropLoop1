import { Star } from 'lucide-react';
import { format } from 'date-fns';

export default function ReviewCard({ review }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    {review.reviewerPhotoURL ? (
                        <img src={review.reviewerPhotoURL} alt={review.reviewerName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold">
                            {review.reviewerName?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div>
                        <h4 className="font-medium text-gray-900">{review.reviewerName}</h4>
                        <p className="text-xs text-gray-500">
                            {review.createdAt?.seconds ? format(new Date(review.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Just now'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-bold text-gray-700">{review.rating}</span>
                </div>
            </div>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                {review.comment}
            </p>
        </div>
    );
}

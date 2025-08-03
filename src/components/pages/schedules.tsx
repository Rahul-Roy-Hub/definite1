"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Clock, Pause, Play, Trash2, ArrowRight, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface SwapOrder {
  id: string;
  pair: string;
  sourceChain: string;
  targetChain: string;
  sourceToken: string;
  targetToken: string;
  amount: string;
  receiveAmount: string;
  bridgeFee: string;
  gasFee: string;
  priceImpact: number;
  exchangeRate: string;
  speed: string;
  estimatedTime: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  createdAt: string;
  quoteData?: any;
}

export function Schedules() {
  const [orders, setOrders] = useState<SwapOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedOrders = localStorage.getItem('swapOrders');
          if (savedOrders) {
            setOrders(JSON.parse(savedOrders));
          }
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'executing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className='h-3 w-3' />;
      case 'executing':
        return <RefreshCw className='h-3 w-3 animate-spin' />;
      case 'completed':
        return <CheckCircle className='h-3 w-3' />;
      case 'failed':
        return <AlertCircle className='h-3 w-3' />;
      default:
        return <Clock className='h-3 w-3' />;
    }
  };

  const deleteOrder = (orderId: string) => {
    try {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('swapOrders', JSON.stringify(updatedOrders));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const clearAllOrders = () => {
    setOrders([]);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('swapOrders');
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const simulateExecution = (orderId: string) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'executing' as const }
        : order
    );
    setOrders(updatedOrders);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('swapOrders', JSON.stringify(updatedOrders));
    }

    setTimeout(() => {
      const completedOrders = orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'completed' as const }
          : order
      );
      setOrders(completedOrders);

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('swapOrders', JSON.stringify(completedOrders));
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-center py-12'>
          <RefreshCw className='h-8 w-8 animate-spin text-cyan-400' />
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-white'>Swap Orders</h2>
          <p className='text-slate-400'>Track your cross-chain swap transactions</p>
        </div>
        <div className='flex space-x-2'>
          {orders.length > 0 && (
            <Button
              variant='outline'
              className='border-red-500/20 text-red-400 hover:bg-red-500/10'
              onClick={clearAllOrders}
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Clear All
            </Button>
          )}
          <Button className='bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'>
            <Plus className='h-4 w-4 mr-2' />
            New Swap
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className='glass-card border-white/10 bg-white/5'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <TrendingUp className='h-12 w-12 text-slate-400 mb-4' />
            <h3 className='text-lg font-semibold text-white mb-2'>No swap orders yet</h3>
            <p className='text-slate-400 text-center mb-4'>
              Create your first cross-chain swap to get started
            </p>
            <Button className='bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600'>
              <Plus className='h-4 w-4 mr-2' />
              Create Swap Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {orders.map((order) => (
            <Card key={order.id} className='glass-card border-white/10 bg-white/5 hover:bg-white/10 transition-all'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg flex items-center'>
                    <span className='text-cyan-400'>{order.sourceToken}</span>
                    <ArrowRight className='h-4 w-4 mx-2 text-slate-400' />
                    <span className='text-purple-400'>{order.targetToken}</span>
                  </CardTitle>
                  <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                    {getStatusIcon(order.status)}
                    <span className='capitalize'>{order.status}</span>
                  </Badge>
                </div>
                <div className='text-sm text-slate-400'>
                  {order.sourceChain} → {order.targetChain}
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div>
                    <span className='text-slate-400'>Amount</span>
                    <div className='text-white font-medium'>{order.amount}</div>
                  </div>
                  <div>
                    <span className='text-slate-400'>You&apos;ll Receive</span>
                    <div className='text-green-400 font-medium'>{order.receiveAmount}</div>
                  </div>
                  <div>
                    <span className='text-slate-400'>Bridge Fee</span>
                    <div className='text-white'>{order.bridgeFee}</div>
                  </div>
                  <div>
                    <span className='text-slate-400'>Gas Fee</span>
                    <div className='text-white'>{order.gasFee}</div>
                  </div>
                  <div>
                    <span className='text-slate-400'>Speed</span>
                    <div className='text-white capitalize'>{order.speed}</div>
                  </div>
                  <div>
                    <span className='text-slate-400'>Est. Time</span>
                    <div className='text-white'>{order.estimatedTime}</div>
                  </div>
                </div>

                {order.priceImpact > 0 && (
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-slate-400'>Price Impact</span>
                    <span className={`font-medium ${order.priceImpact > 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {order.priceImpact.toFixed(2)}%
                    </span>
                  </div>
                )}

                <div className='text-xs text-slate-500 pt-2 border-t border-white/10'>
                  Created: {formatTime(order.createdAt)}
                </div>

                <div className='flex items-center justify-between pt-2'>
                  <div className='flex space-x-2'>
                    {order.status === 'pending' && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='border-green-500/20 text-green-400 hover:bg-green-500/10'
                        onClick={() => simulateExecution(order.id)}
                      >
                        <Play className='h-3 w-3 mr-1' />
                        Execute
                      </Button>
                    )}
                    <Button
                      variant='outline'
                      size='sm'
                      className='border-red-500/20 text-red-400 hover:bg-red-500/10'
                      onClick={() => deleteOrder(order.id)}
                    >
                      <Trash2 className='h-3 w-3 mr-1' />
                      Delete
                    </Button>
                  </div>
                  <Button variant='ghost' size='sm' className='text-cyan-400'>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {orders.length > 0 && (
        <div className='text-center text-sm text-slate-400'>
          Showing {orders.length} swap order{orders.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

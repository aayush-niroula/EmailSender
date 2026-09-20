<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
</head>

<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: Arial, Helvetica, sans-serif; color: #333333;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8; padding: 40px 20px;">
        <tr>
            <td align="center">

                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden;">

                    <tr>
                        <td style="background-color: #111827; padding: 24px 30px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600;">
                                {{ config('app.name') }}
                            </h1>
                        </td>
                    </tr>

                
                    <tr>
                        <td style="padding: 35px 30px;">

                            <h2 style="margin: 0 0 20px; font-size: 20px; color: #111827;">
                                {{ $subject }}
                            </h2>

                            <div style="font-size: 15px; line-height: 1.7; color: #4b5563;">
                                {!! nl2br(e($body)) !!}
                            </div>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="border-top: 1px solid #e5e7eb; padding: 20px 30px; text-align: center;">

                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                This email was sent by {{ config('app.name') }}.
                            </p>

                            <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">
                                Please do not reply to this automated message.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>